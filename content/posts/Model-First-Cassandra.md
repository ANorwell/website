<p>At Datto, we are heavy users of Cassandra. Backupify, our cloud-to-cloud backup product, uses it to track and index over twenty billion backed-up items. Additionally, we use Cassandra to track customer activity, store file hierarchies, and track backup progress. Because we use Cassandra so heavily, it&#39;s important that developers can quickly prototype and implement new data models. </p>
<p>Cassandra is not the relational database you know and love, and the data access patterns that work for relational databases are not necessarily appropriate.</p>
<p>Datto has spent a lot of time trying to solve this problem, and has developed several open source Ruby gems that together provide an end-to-end data modelling approach that aims to balance ease-of-use with flexibility and scalability. These gems include <a href="https://github.com/datto/pyper">Pyper</a>, a gem for constructing pipelines for data storage and retrieval, <a href="https://github.com/datto/cass_schema">CassSchema</a>, a tool for maintaining Cassandra schemas, and <a href="https://github.com/datto/cassava">Cassava</a>, a Cassandra client. This post will outline the motivations for the storage approach we take with these gems, and go over an example implementation.</p>
<p>But first, some background.</p>
<h3 id="data-access-and-index-tables">Data Access and Index Tables</h3>
<p>Unlike relational databases, Cassandra offers little flexibility in terms of data access. Data must be read out in the order defined by a table&#39;s clustering key. Table joins are not available. This imposes two guiding principles when accessing data at scale:</p>
<ol>
<li><p><strong>Data should be stored according to access pattern.</strong> Data may only be retrieved according to the clustering key in the table in which it is stored. If data must be accessed in multiple ways, then it must be stored in multiple tables.</p>
</li>
<li><p><strong>Denormalization is generally preferred.</strong> In cases where multiple access patterns are needed and multiple tables exist, it&#39;s generally preferable to denormalize this data – that is, completely duplicate every required field in each table. While this comes at a cost of additional storage space, it allows data to be read from a single Cassandra node using sequential disk access, considerably reducing latency and cluster load.</p>
</li>
</ol>
<p>Both of these are standard Cassandra data modelling <a href="http://www.datastax.com/dev/blog/basic-rules-of-cassandra-data-modeling">rules of thumb</a>, and this article won&#39;t examine them in-depth. Instead, this article considers the repercussions these principles have on the data model and persistence layers of an application.</p>
<p>The following example schema illustrates these principles at work:</p>
<pre><code>CREATE TABLE events_by_id(
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
)</code></pre>
<p>Each table here provides a different access pattern: <code>events_by_id</code> allows access to each event ordered by id, while <code>events_by_type</code> allows access to each event of a given event_type. The tables are denormalized, because both tables contain the event_data field.</p>
<h3 id="models-and-access-patterns">Models And Access Patterns</h3>
<p>In the example above, the tables events_by_id and events_by_type represent access patterns into some implicit &quot;event&quot; data type, but this type is not explicitly defined in the schema. We might expect an event to look something like:</p>
<pre><code>Event
 - id
 - user_id
 - event_type
 - event_data</code></pre>
<p>Comparing this to the Cassandra schema, we see there is no one-to-one correspondence between data types and Cassandra tables. Most object-oriented data access patterns, such as <a href="https://github.com/cequel/cequel">ActiveRecord</a>, are built around the assumption that a model is stored in a single table. In this case, taking such an approach would result in classes with names like EventsById and EventsByType. This obscures the Event data type itself, making the underlying data model more difficult to understand. The application layer does not want to interact with an EventsByType. It wants to interact with an Event. <a href="#model-first-cassandra-footnotes">[1]</a></p>
<p>An alternative approach makes an Event class the first-class citizen, combined with a set of methods that define the access pattern. For example, we might decide on the following data model and access patterns:</p>
<pre><code>Event
 - id
 - user_id
 - event_type
 - event_data

- store(event): stores a single event
- find(user_id, id): finds a single event by user_id, id
- events_by_id(user_id): all events, ordered by id, for a user
- events_by_type(user_id, event_type): all events, ordered by id,
    for a user and event type</code></pre>
<p>These are the first-class citizens of the model, and should be first and foremost in the implementation.</p>
<h3 id="the-building-blocks-of-an-implementation">The Building Blocks of an Implementation</h3>
<p>Let&#39;s get into the nitty-gritty of a full Ruby implementation of the model above, from the model class all the way back to schema management. Here are the tools we will use:</p>
<h4 id="virtus">Virtus</h4>
<p><a href="https://github.com/solnic/virtus">Virtus</a> is a gem for defining &quot;plain old Ruby&quot; objects with attributes. We will use it to define the Event data model. There are many gems that do similar things, but I prefer Virtus for two reasons:</p>
<ul>
<li><p>It supports fairly robust typing on attributes.</p>
</li>
<li><p>It allows mixins and inheritance to be used among model classes, allowing for richer model definitions.</p>
</li>
</ul>
<p>Let&#39;s define a basic Event class using Virtus:</p>
<pre><code>require &#39;virtus&#39;

class Event
  include Virtus.model
  attribute :id, String, :default =&gt; proc { SecureRandom.uuid }
  attribute :user_id, Integer
  attribute :event_type, String
  attribute :event_data, String
end</code></pre>
<h4 id="cassschema">CassSchema</h4>
<p><a href="https://github.com/datto/cass_schema">CassSchema</a>, is a Datto-developed gem for Cassandra Schema management. It allows a user to define a schema and migrations for different &quot;datastores&quot;, each of which is associated with a cluster and keyspace. (This allows the application to access multiple clusters at once, something we use heavily at Datto.) Schema files are defined in the <code>cass_schema/cass_schema/&lt;datastore&gt;/schema.cql</code> file by default, while migrations live in <code>cass_schema/&lt;datastore&gt;/migrations/</code>. Unlike ActiveRecord, migration state is not tracked and migrations are not ordered.</p>
<p>Let&#39;s define a schema.cql file for our event class:</p>
<pre><code>CREATE TABLE events_by_id(
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
)</code></pre>
<p>And let&#39;s define a cass_schema.yml config file, associating the datastore events_datastore with the schema defined above:</p>
<pre><code>datastores:
events_datastore:
  hosts: 127.0.0.1
  port: 9242
  keyspace: test_keyspace
  replication: &quot;{ &#39;class&#39; : &#39;SimpleStrategy&#39;, &#39;replication_factor&#39; : 1 }&quot;</code></pre>
<p>To use CassSchema to create our schema, we run CassSchema::Runner.create_all or run the cass:schema:create_all Rake task.</p>
<h4 id="cassava-and-the-datastax-cassandra-client">Cassava and the Datastax Cassandra Client</h4>
<p><a href="https://github.com/datto/cassava">Cassava</a> is an unopinionated wrapper around the excellent <a href="https://github.com/datastax/ruby-driver">Datastax Cassandra Client</a>, providing more flexible, ActiveModel-esque syntax for Cassandra queries. For example, client.select(:my_table).where(id: 3).execute runs a select statement on the my_table table. I developed Cassava internally at Datto.</p>
<p>While we can easily instantiate a Cassava client from scratch, it makes sense to base it off the configuration defined for CassSchema above. CassSchema actually uses and exposes a Cassava client, which we can access as follows:</p>
<pre><code>session = CassSchema::Runner.datastore_lookup(:events_datastore).client
client = Cassava::Client.new(session)</code></pre>
<h3 id="pyper">Pyper</h3>
<p><a href="https://github.com/datto/pyper">Pyper</a> is a Datto-developed gem for constructing sequential pipelines of operations. It includes modules for storing and retrieving data using Cassandra. Common activities such as validation, serialization, and pagination are composed together as building blocks, or &quot;pipes&quot;.</p>
<p>Pyper makes the intentional design decision of leaving the construction of the pipeline to the user of the library. In other words, it has no restrictions over things like how a model is serialized, or to how many tables in Cassandra data is written – or even whether data is stored in Cassandra at all!</p>
<p>At Datto, this flexibility allows us to experiment and prototype data storage approaches without wrestling with a rigid framework. By encapsulating common operations as pipes, creating a data access pipeline tends not to be excessively verbose. Usually, developers can concentrate on determining the ordering of each step in the pipeline, rather than worrying about the details involved in each pipe.</p>
<p>Let&#39;s make this more concrete by defining pipelines to write and read data in our Event example. Here is a write pipe, which stores an event to both the events_by_id table and the events_by_type table.</p>
<pre><code># @param event [Event] The event to store
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

  # Push the event&#39;s attribute hash down the pipeline, executing each step in sequence
  pipeline.push(event.attributes)
end</code></pre>
<p>Each pipe in the pipeline adds a subsequent step to the series of operations performed on the event attributes that are initially pushed down the pipeline. The pipeline defined here will serialize the attributes from the model class, then write the attributes to the events_by_id table, then write the attributes to the events_by_type table.</p>
<p>And here is a read pipe that retrieves a page of events for a given event type, using the events_by_type Cassandra table.</p>
<pre><code># Returns all events of a specific type for a specific user
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
end</code></pre>
<p>Pairing with the write pipe, this will read the items from the events_by_type table, deserialize them, and then parse an Event object for each retrieved event.</p>
<p>Pipelines for the other read access patterns are very similar, and have been left out here.</p>
<h3 id="expressiveness-vs-flexibility-tradeoffs">Expressiveness vs. Flexibility Tradeoffs</h3>
<p>A full, working version of the above example can be <a href="https://github.com/ANorwell/event_example">found here</a>. This includes all three read access patterns: by event type, by user, and lookup by event ID. Because these three different data access patterns are similar, code for the read pipelines can be shared. All-told, it is 50 lines of Ruby code and six lines of configuration. This might seem like a lot: an ActiveRecord version of a similar model would be a dozen lines of code at most.</p>
<p>The gain here, arguably, is one of improved flexibility and extensibility. First, by separating the model (Event) from how it is stored (EventInterface) allows for the storage mechanism to be changed in the future. By keeping Event as a plain Ruby object, we have a stronger guarantee that storage concerns have not leaked into the data model classes.</p>
<p>Second, Pyper makes explicit each step taken by each data access pattern. The goal of the library is to allow flexibility in the definitions of the data access patterns. For example, if we decide we need to store additional metadata as part of the storage process, it is just a matter of adding an additional pipe as part of the pipeline defined in the store method.</p>
<p>For small projects, the flexibility gained here might not be useful. Not all projects are concerned with changing their data access patterns. At this level, ORMs such as <a href="http://api.rubyonrails.org/classes/ActiveRecord/Base.html">ActiveRecord</a> (or the Cassandra-based <a href="https://github.com/cequel/cequel">cequel gem</a>) might be more appropriate. At the scale and complexity of Datto&#39;s cloud-to-cloud backup infrastructure, however, this flexibility is important.</p>
<h2 id="footnotes">Footnotes</h2>
<div id="model-first-cassandra-footnotes"></div>
[1] Of course, ORMs need not have this restriction: they could provide some means of specifying which data access patterns are needed, and from this infer the desired schema. We have not gone this far, and there are some arguments for not doing so. In the approach outlined in this post, the data model is explicitly decoupled from the storage medium(s).
