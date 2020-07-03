---
title: Model-First Cassandra in Ruby
date: 01-24-2016
tags: projects, ruby
---

At Datto, we are heavy users of Cassandra. Backupify, our cloud-to-cloud backup product, uses it to track and index over twenty billion backed-up items. Additionally, we use Cassandra to track customer activity, store file hierarchies, and track backup progress. Because we use Cassandra so heavily, it's important that developers can quickly prototype and implement new data models. 

Cassandra is not the relational database you know and love, and the data access patterns that work for relational databases are not necessarily appropriate.

Datto has spent a lot of time trying to solve this problem, and has developed several open source Ruby gems that together provide an end-to-end data modelling approach that aims to balance ease-of-use with flexibility and scalability. These gems include [Pyper](https://github.com/datto/pyper), a gem for constructing pipelines for data storage and retrieval, [CassSchema](https://github.com/datto/cass_schema), a tool for maintaining Cassandra schemas, and [Cassava](https://github.com/datto/cassava), a Cassandra client. This post will outline the motivations for the storage approach we take with these gems, and go over an example implementation.

But first, some background.

### Data Access and Index Tables

Unlike relational databases, Cassandra offers little flexibility in terms of data access. Data must be read out in the order defined by a table's clustering key. Table joins are not available. This imposes two guiding principles when accessing data at scale:

1. **Data should be stored according to access pattern.** Data may only be retrieved according to the clustering key in the table in which it is stored. If data must be accessed in multiple ways, then it must be stored in multiple tables.

2. **Denormalization is generally preferred.** In cases where multiple access patterns are needed and multiple tables exist, it's generally preferable to denormalize this data – that is, completely duplicate every required field in each table. While this comes at a cost of additional storage space, it allows data to be read from a single Cassandra node using sequential disk access, considerably reducing latency and cluster load.

Both of these are standard Cassandra data modelling [rules of thumb](http://www.datastax.com/dev/blog/basic-rules-of-cassandra-data-modeling), and this article won't examine them in-depth. Instead, this article considers the repercussions these principles have on the data model and persistence layers of an application.

The following example schema illustrates these principles at work:

    CREATE TABLE events_by_id(
      id text,
      user_id int,
      event_type text,
      event_data text,
      PRIMARY KEY ((user_id), id)
    )
    
    CREATE TABLE events_by_type(
      id text,
      user_id int,
      event_type text,
      event_data text,
      PRIMARY KEY ((user_id, event_type), id)
    )

Each table here provides a different access pattern: `events_by_id` allows access to each event ordered by id, while `events_by_type` allows access to each event of a given event_type. The tables are denormalized, because both tables contain the event_data field.

### Models And Access Patterns

In the example above, the tables events_by_id and events_by_type represent access patterns into some implicit "event" data type, but this type is not explicitly defined in the schema. We might expect an event to look something like:

    Event
     - id
     - user_id
     - event_type
     - event_data

Comparing this to the Cassandra schema, we see there is no one-to-one correspondence between data types and Cassandra tables. Most object-oriented data access patterns, such as [ActiveRecord](https://github.com/cequel/cequel), are built around the assumption that a model is stored in a single table. In this case, taking such an approach would result in classes with names like EventsById and EventsByType. This obscures the Event data type itself, making the underlying data model more difficult to understand. The application layer does not want to interact with an EventsByType. It wants to interact with an Event. [[1]](#model-first-cassandra-footnotes)

An alternative approach makes an Event class the first-class citizen, combined with a set of methods that define the access pattern. For example, we might decide on the following data model and access patterns:

    Event
     - id
     - user_id
     - event_type
     - event_data
    
    - store(event): stores a single event
    - find(user_id, id): finds a single event by user_id, id
    - events_by_id(user_id): all events, ordered by id, for a user
    - events_by_type(user_id, event_type): all events, ordered by id,
        for a user and event type

These are the first-class citizens of the model, and should be first and foremost in the implementation.

### The Building Blocks of an Implementation

Let's get into the nitty-gritty of a full Ruby implementation of the model above, from the model class all the way back to schema management. Here are the tools we will use:

#### Virtus

[Virtus](https://github.com/solnic/virtus) is a gem for defining "plain old Ruby" objects with attributes. We will use it to define the Event data model. There are many gems that do similar things, but I prefer Virtus for two reasons:

* It supports fairly robust typing on attributes.

* It allows mixins and inheritance to be used among model classes, allowing for richer model definitions.

Let's define a basic Event class using Virtus:

    require 'virtus'
    
    class Event
      include Virtus.model
      attribute :id, String, :default => proc { SecureRandom.uuid }
      attribute :user_id, Integer
      attribute :event_type, String
      attribute :event_data, String
    end

#### CassSchema

[CassSchema](https://github.com/datto/cass_schema), is a Datto-developed gem for Cassandra Schema management. It allows a user to define a schema and migrations for different "datastores", each of which is associated with a cluster and keyspace. (This allows the application to access multiple clusters at once, something we use heavily at Datto.) Schema files are defined in the `cass_schema/cass_schema/<datastore>/schema.cql` file by default, while migrations live in `cass_schema/<datastore>/migrations/`. Unlike ActiveRecord, migration state is not tracked and migrations are not ordered.

Let's define a schema.cql file for our event class:

    CREATE TABLE events_by_id(
      id text,
      user_id int,
      event_type text,
      event_data text,
      PRIMARY KEY ((user_id), id)
    )
    
    CREATE TABLE events_by_type(
      event_id text,
      user_id int,
      event_type text,
      event_data text,
      PRIMARY KEY ((user_id, event_type), id)
    )

And let's define a cass_schema.yml config file, associating the datastore events_datastore with the schema defined above:

    datastores:
    events_datastore:
      hosts: 127.0.0.1
      port: 9242
      keyspace: test_keyspace
      replication: "{ 'class' : 'SimpleStrategy', 'replication_factor' : 1 }"

To use CassSchema to create our schema, we run CassSchema::Runner.create_all or run the cass:schema:create_all Rake task.

#### Cassava and the Datastax Cassandra Client

[Cassava](https://github.com/datto/cassava) is an unopinionated wrapper around the excellent [Datastax Cassandra Client](https://github.com/datastax/ruby-driver), providing more flexible, ActiveModel-esque syntax for Cassandra queries. For example, client.select(:my_table).where(id: 3).execute runs a select statement on the my_table table. I developed Cassava internally at Datto.

While we can easily instantiate a Cassava client from scratch, it makes sense to base it off the configuration defined for CassSchema above. CassSchema actually uses and exposes a Cassava client, which we can access as follows:

    session = CassSchema::Runner.datastore_lookup(:events_datastore).client
    client = Cassava::Client.new(session)

### Pyper

[Pyper](https://github.com/datto/pyper) is a Datto-developed gem for constructing sequential pipelines of operations. It includes modules for storing and retrieving data using Cassandra. Common activities such as validation, serialization, and pagination are composed together as building blocks, or "pipes".

Pyper makes the intentional design decision of leaving the construction of the pipeline to the user of the library. In other words, it has no restrictions over things like how a model is serialized, or to how many tables in Cassandra data is written – or even whether data is stored in Cassandra at all!

At Datto, this flexibility allows us to experiment and prototype data storage approaches without wrestling with a rigid framework. By encapsulating common operations as pipes, creating a data access pipeline tends not to be excessively verbose. Usually, developers can concentrate on determining the ordering of each step in the pipeline, rather than worrying about the details involved in each pipe.

Let's make this more concrete by defining pipelines to write and read data in our Event example. Here is a write pipe, which stores an event to both the events_by_id table and the events_by_type table.

    # @param event [Event] The event to store
    def store(event)
      pipeline = Pyper::Pipeline.create do
        # First, serialize any hash/array fields on the attribute hash.
        # This is not needed for the event model and just for demonstration
        add Pyper::Pipes::Model::AttributeSerializer.new
    
        # Write to the events_by_id table using the Cassava client
        add Pyper::Pipes::Cassandra::Writer.new(:events_by_id, client)
    
        # Write to the events_by_type table using the Cassava client
        add Pyper::Pipes::Cassandra::Writer.new(:events_by_type, client)
      end
    
      # Push the event's attribute hash down the pipeline, executing each step in sequence
      pipeline.push(event.attributes)
    end

Each pipe in the pipeline adds a subsequent step to the series of operations performed on the event attributes that are initially pushed down the pipeline. The pipeline defined here will serialize the attributes from the model class, then write the attributes to the events_by_id table, then write the attributes to the events_by_type table.

And here is a read pipe that retrieves a page of events for a given event type, using the events_by_type Cassandra table.

    # Returns all events of a specific type for a specific user
    # @param user_id [Integer]
    # @param event_type [String]
    # @option options [String] :paging_state If provided, fetch this page of results
    # @return [Array] A pair containing an Array of results along with a next page token, if any
    def events_by_type(user_id, event_type, options = {})
      pipeline = Pyper::Pipeline.create do
        # Fetch the raw items from the table, as specified by the parameters sent down the pipeline
        add Pyper::Pipes::Cassandra::Reader.new(:events_by_type, client)
    
        # Deserialize Hash and Array fields of each event based on the the attributes
        # declared within the Event class. Not strictly needed since Event has no
        # fields of this type
        add Pyper::Pipes::Model::VirtusDeserializer.new(Event.attribute_set)
    
        # Create new Event objects from the raw attribute hashes
        add Pyper::Pipes::Model::VirtusParser.new(Event)
      end
    
      # Push the specified user_id and event_type down the pipeline. These will be used by the
      # CassandraItems pipe to determine which events are retrieved. Subsequent pipes will
      # deserialize the data and instantiate the Event objects.
      result = pipeline.push(options.merge(user_id: user_id, event_type: event_type))
      [result.value.to_a, result.status[:paging_state]]
    end

Pairing with the write pipe, this will read the items from the events_by_type table, deserialize them, and then parse an Event object for each retrieved event.

Pipelines for the other read access patterns are very similar, and have been left out here.

### Expressiveness vs. Flexibility Tradeoffs

A full, working version of the above example can be [found here](https://github.com/ANorwell/event_example). This includes all three read access patterns: by event type, by user, and lookup by event ID. Because these three different data access patterns are similar, code for the read pipelines can be shared. All-told, it is 50 lines of Ruby code and six lines of configuration. This might seem like a lot: an ActiveRecord version of a similar model would be a dozen lines of code at most.

The gain here, arguably, is one of improved flexibility and extensibility. First, by separating the model (Event) from how it is stored (EventInterface) allows for the storage mechanism to be changed in the future. By keeping Event as a plain Ruby object, we have a stronger guarantee that storage concerns have not leaked into the data model classes.

Second, Pyper makes explicit each step taken by each data access pattern. The goal of the library is to allow flexibility in the definitions of the data access patterns. For example, if we decide we need to store additional metadata as part of the storage process, it is just a matter of adding an additional pipe as part of the pipeline defined in the store method.

For small projects, the flexibility gained here might not be useful. Not all projects are concerned with changing their data access patterns. At this level, ORMs such as [ActiveRecord](http://api.rubyonrails.org/classes/ActiveRecord/Base.html) (or the Cassandra-based [cequel gem](https://github.com/cequel/cequel)) might be more appropriate. At the scale and complexity of Datto's cloud-to-cloud backup infrastructure, however, this flexibility is important.

## Footnotes
<div id="model-first-cassandra-footnotes"></div>
[1] Of course, ORMs need not have this restriction: they could provide some means of specifying which data access patterns are needed, and from this infer the desired schema. We have not gone this far, and there are some arguments for not doing so. In the approach outlined in this post, the data model is explicitly decoupled from the storage medium(s).
