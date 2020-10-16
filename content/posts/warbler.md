<h1 id="warbler">warbler</h1>
<p><a href="https://github.com/ANorwell/warbler">Warbler</a> is an AWS lambda-based chat service, managed by Terraform.</p>
<p>Warbler is a toy project using AWS serverless primitives to build a small chat service. Processing is handled by lambda functions, DynamoDB is used for storage, and static frontend assets are hosted on S3. It provides the ability for users to chat</p>
<p>All AWS resources are defined as terraform configuration files.</p>
<h2 id="diagram">Diagram</h2>
<pre><code>+-----------+        +-----------+                          +---------+       +-----------+
|           |        |           |    +-------------+       |         |       |           |
| Frontend  |        | Read/Write+----&gt;     SNS     +-------&gt; Writer  +-------&gt;           |
|           +-------&gt;+    API    |    +-------------+       |         |       |   Store   |
|           |        |           |                          |         |       | (DynamoDB)|
+-----------+        +-----------+                          +---------+       |           |
                                 |                                            |           |
                                 +-------------------------------------------&gt;+-----------+
                                                    Reads</code></pre>
<h2 id="shortcomings">Shortcomings</h2>
<p>This was primarily a project to experiment with Terraform and composing AWS resources. This project is in a place where the various components <em>could</em> be expanded to support more functionality, but do not. Some extensions that are not implemented but would be interesting:</p>
<ul>
<li>Better configuration and support for multiple environments. Currently, there are multiple places with hardcoded endpoints, which would have to become configurable to support multiple environments. Terraform has <a href="https://terragrunt.gruntwork.io/">terragrunt</a> to help solve this problem, but the services need a better solution for endpoint discovery or configuration.</li>
<li>Better development workflow. One thing I wanted to investigate with this project was what the development workflow in a serverless environment was like. I followed a workflow where the development environment lived in the cloud, and every code change required a deploy. This deploy process was relatively fast, but it is not as good as localhost-based web development, and it seems like there would be a large amount of parallel work needed to get this environment running outside of the cloud. </li>
<li>Better chat features. Lambda supports websockets, which would enable real-time conversations. And while warbler supports multiple conversations, there&#39;s no directory of conversations, or otherwise ways to discover which conversations might exist.</li>
</ul>
<h2 id="deployment">Deployment</h2>
<p><code>terraform apply</code>, after configuring aws-cli appropriately. If lambdas change, run <code>make</code> to re-package them.</p>
<p>To create a new environment, a few things are needed:</p>
<ol>
<li>Bucket names are globally unique, and so must be changed.</li>
<li>The provisioned SNS ARN and API endpoint must be added to the appropriate lambdas -- as per above, there is no configuration of these values.</li>
</ol>
