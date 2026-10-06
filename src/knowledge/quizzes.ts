import { Domain } from "../lib/knowledge";

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const QUIZ_BANK: Record<Domain, QuizQuestion[]> = {
  dsa: [
    {
      question: "You are designing an in-memory LRU (Least Recently Used) cache for high-throughput API responses. The system must support O(1) lookups and O(1) eviction of the oldest entry upon capacity overflow. Which architectural data structure combination best guarantees these requirements?",
      options: [
        "A standard dynamic array paired with binary search, sorting elements whenever an item is accessed",
        "A Hash Map paired with a Doubly Linked List, where the map enables O(1) node lookup and the list enables O(1) node removal and re-insertion at the head",
        "A Min-Heap prioritized by access timestamp combined with a Singly Linked List",
        "A Balanced Binary Search Tree (Red-Black tree) indexing nodes by monotonic insertion sequence"
      ],
      correctIndex: 1,
      explanation: "A Hash Map provides O(1) key-to-node pointer lookup. A Doubly Linked List allows detaching any node in O(1) time without traversing, and moving it to the head as most recently used or evicting from the tail in O(1)."
    },
    {
      question: "In a financial exchange order-matching engine, price levels are searched and updated millions of times per second. Why is a balanced Binary Search Tree (such as Red-Black or AVL) preferred over an unaugmented Hash Table for order-book price depth queries?",
      options: [
        "Hash tables cannot store numeric keys or price values accurately due to 64-bit floating point limitations",
        "Balanced BSTs support range queries, finding the nearest ceiling/floor price, and ordered min/max retrievals in O(log n) time, which hash tables cannot do in O(1)",
        "Balanced BSTs provide O(1) amortized insertion whereas Hash Tables require O(n^2) worst-case collision chaining",
        "Hash tables require full rehashing on every insert which blocks lock-free concurrency"
      ],
      correctIndex: 1,
      explanation: "While Hash Tables provide O(1) average exact lookups, they are inherently unordered. Order matching requires finding best bids/asks, floor/ceiling prices, and iterating over price intervals in sorted order, which balanced BSTs achieve in O(log n) time."
    },
    {
      question: "You are implementing a build dependency resolver for a monorepo containing thousands of interconnected packages. Which algorithm detects circular dependencies and produces a valid compilation sequence?",
      options: [
        "Kruskal's Algorithm using Disjoint Set Union to build a minimum spanning tree",
        "Topological Sort using Kahn's algorithm (in-degree tracking) or Depth First Search with 3-color node state tracking (unvisited, visiting, visited)",
        "Floyd-Warshall all-pairs shortest path matrix relaxation",
        "Dijkstra's single-source shortest path algorithm using a Fibonacci heap"
      ],
      correctIndex: 1,
      explanation: "Dependency graphs are Directed Acyclic Graphs (DAGs). Topological sort computes an execution order where all dependencies precede dependents. A cycle is detected if a back-edge is encountered during DFS (encountering a node currently in the 'visiting' recursion stack) or if in-degrees do not reach zero in Kahn's algorithm."
    },
    {
      question: "During a code review, an engineer notes that a standard QuickSort implementation degrades to O(n²) time complexity on production payloads. What scenario triggers this worst-case performance, and how is it mitigated?",
      options: [
        "The input array contains strictly unique random values; mitigated by switching to Bubble Sort",
        "The input array is already sorted or nearly sorted when choosing the first or last element as pivot; mitigated by using randomized pivot selection or the Median-of-Three strategy",
        "The array size exceeds 2^32 elements; mitigated by upgrading from 32-bit to 64-bit indices",
        "All elements are powers of two causing integer overflow in the partition index"
      ],
      correctIndex: 1,
      explanation: "When the pivot is consistently chosen as the extremum (first or last element) in already sorted or identical-key inputs, partitioning splits the array into sizes 0 and n-1, producing an O(n²) recursion tree. Choosing randomized pivots or median-of-three guarantees balanced partitions with high probability."
    },
    {
      question: "A latency-critical microservice monitors network routing across an unweighted graph of microservice nodes. What is the most computationally efficient algorithm to determine the minimum number of network hops between two services?",
      options: [
        "Depth First Search (DFS) with recursive backtracking",
        "Breadth First Search (BFS) starting from the source service node",
        "Bellman-Ford algorithm with edge relaxation over V iterations",
        "Prim's greedy minimum spanning tree algorithm"
      ],
      correctIndex: 1,
      explanation: "In an unweighted graph, BFS explores vertices layer by layer (by distance 1, 2, 3 hops). The first time the destination node is visited, the path is guaranteed to be the shortest hop path in O(V + E) time, whereas DFS may traverse deep suboptimal branches first."
    },
    {
      question: "You need to compute the maximum sum of any contiguous subarray of size k across a real-time stream of 10 million telemetry events. How should you structure your algorithm for optimal performance?",
      options: [
        "Iterate through every starting index and run an inner loop summing the subsequent k elements in O(n · k) time",
        "Maintain a sliding window of size k: calculate the initial window sum, then slide forward by adding the new incoming element and subtracting the element leaving the window in O(1) per step, yielding O(n) total time",
        "Sort the entire telemetry array first in O(n log n) and select the top k elements",
        "Construct a binary search tree of all prefixes and execute range interval queries in O(n log k)"
      ],
      correctIndex: 1,
      explanation: "The Sliding Window pattern avoids recalculating duplicate overlapping subsegments. Shifting the window requires only 1 addition and 1 subtraction, processing each element in O(1) time with O(1) auxiliary space."
    },
    {
      question: "When finding the Top K most frequent search queries in a large dataset of N terms, which approach minimizes memory usage while achieving O(N log K) time complexity?",
      options: [
        "Sort all N unique elements using MergeSort in O(N log N) time and slice the first K elements",
        "Count frequencies into a Hash Map, then maintain a Min-Heap of size K: if an incoming frequency exceeds the heap root, pop the root and insert the new element",
        "Construct a complete Max-Heap of all N elements and perform K extract-max operations",
        "Insert all queries into a Singly Linked List and execute linear scan K times"
      ],
      correctIndex: 1,
      explanation: "Maintaining a Min-Heap capped at size K ensures heap operations take O(log K) rather than O(log N). The heap root always holds the K-th largest frequency seen so far, keeping memory bounded strictly to O(K) rather than retaining all N elements in a heap."
    },
    {
      question: "You are building a search autocomplete service that must support prefix matching against 500,000 dictionary words. Why is a Trie (Prefix Tree) architecturally superior to a Hash Map for this feature?",
      options: [
        "Tries use zero memory overhead compared to primitive strings",
        "A Trie allows finding all words sharing a common prefix of length L in O(L + M) time (where M is the number of matching words), whereas a Hash Map cannot search prefixes without scanning all keys",
        "Hash Maps cannot store alphanumeric strings longer than 32 characters due to hashing limits",
        "Tries execute search queries concurrently without thread locking"
      ],
      correctIndex: 1,
      explanation: "A Hash Map only supports exact key lookups (O(1)). Searching for prefixes like 'eng*' in a Hash Map requires scanning all keys in O(N). A Trie navigates directly to the prefix node in O(L) steps and traverses descendants to produce completions."
    },
    {
      question: "In deeply nested trees or graphs with depths up to 100,000, recursive Depth First Search causes JVM/V8 Call Stack Overflow errors. How should an engineer rewrite the traversal to safely handle arbitrary depths?",
      options: [
        "Increase CPU clock frequency to accelerate stack frame clearance",
        "Convert the recursive traversal to an iterative DFS using an explicit heap-allocated Stack data structure",
        "Switch the recursive calls to execute within JavaScript setTimeout closures",
        "Split the tree across multiple threads without synchronizing nodes"
      ],
      correctIndex: 1,
      explanation: "Call stacks have strict memory limits (typically 1MB-8MB), overflowing after a few thousand frames. Moving recursion to an iterative loop with an explicit heap-allocated Stack (or Queue for BFS) removes the call stack limitation, safely utilizing available heap memory."
    },
    {
      question: "You are designing a rate-limiting algorithm that restricts client requests to 100 requests per minute with smooth burst handling. What is the fundamental difference between the Token Bucket and Fixed Window Counter algorithms?",
      options: [
        "Fixed Window counters allow burst traffic to scale indefinitely without tracking limits",
        "Fixed Window counters suffer from the 2x burst boundary problem (allowing up to 200 requests across a boundary transition), whereas Token Bucket refuels continuously and smooths burst spikes",
        "Token Bucket requires O(n) memory per request while Fixed Window requires zero memory",
        "Token Bucket rejects all requests that arrive within 10 milliseconds of each other"
      ],
      correctIndex: 1,
      explanation: "Fixed Window resets counts at fixed intervals, meaning 100 requests at 0:59 followed by 100 requests at 1:01 yields 200 requests within 2 seconds. Token Bucket refuels tokens at a constant rate, accommodating transient bursts up to bucket capacity while enforcing a smooth long-term rate."
    }
  ],

  springboot: [
    {
      question: "In a Spring Boot application, Bean A injects Bean B via constructor injection, and Bean B injects Bean A via constructor injection. What happens during ApplicationContext initialization, and what is the best architectural fix?",
      options: [
        "Spring automatically serializes one bean to disk and resolves the dependency at runtime",
        "The ApplicationContext fails to start with a BeanCurrentlyInCreationException due to an unresolvable circular dependency; resolved by refactoring design to eliminate cyclical dependencies or using `@Lazy` injection",
        "Spring ignores Bean B and instantiates Bean A with a null reference",
        "The JVM encounters an infinite heap allocation and terminates with an OutOfMemoryError"
      ],
      correctIndex: 1,
      explanation: "Constructor injection requires the dependent bean to be fully constructed before creating the target bean. When both beans require each other in their constructors, neither can be instantiated, causing BeanCurrentlyInCreationException. Refactoring with an intermediary service or applying `@Lazy` (which injects a dynamic proxy) resolves the cycle."
    },
    {
      question: "A high-traffic e-commerce microservice experiences significant database query spikes when fetching Orders and their associated OrderItems using Spring Data JPA. What is the root cause of this 'N+1 query problem', and how is it resolved?",
      options: [
        "Hibernate executes 1 query for the N orders, plus N separate SELECT queries for each order's items due to lazy loading; resolved using `JOIN FETCH` in JPQL or `@EntityGraph`",
        "Database connection pool exhaustion forces JDBC to batch queries into N+1 chunks; resolved by doubling pool size",
        "The SQL database does not support primary keys on child tables; resolved by enabling auto-increment",
        "Spring Boot Actuator runs background health checks that duplicate every query N times"
      ],
      correctIndex: 0,
      explanation: "The N+1 problem occurs when fetching a list of N parent entities with lazily-loaded child associations. Iterating over parents triggers N additional queries to fetch children. Specifying a `JOIN FETCH` query or `@EntityGraph` fetches parents and children in a single joined SQL query."
    },
    {
      question: "An engineer annotates a public method with `@Transactional`. Inside the method, a checked `IOException` is thrown during file processing. By default, what does Spring's transaction manager do?",
      options: [
        "The transaction is immediately rolled back for all exceptions including checked exceptions",
        "By default, Spring only rolls back transactions on unchecked exceptions (RuntimeExceptions and Errors); the database changes will commit unless `rollbackFor = Exception.class` is explicitly specified",
        "Spring converts the checked exception into a 500 HTTP response and retries the transaction 3 times",
        "The database connection is aborted and severed from the connection pool"
      ],
      correctIndex: 1,
      explanation: "By default in Spring declarative transactions, rollback occurs automatically ONLY for unchecked exceptions (subclasses of RuntimeException and Error). Checked exceptions (like IOException, SQLException) will NOT trigger a rollback unless configured via `@Transactional(rollbackFor = Exception.class)`."
    },
    {
      question: "In a Spring Boot MVC controller, a developer calls a `@Transactional` method `processPayment()` from another method `checkout()` within the exact same service class (`this.processPayment()`). Why does the transaction fail to start?",
      options: [
        "Spring Boot does not allow multiple methods in a single service class to interact with databases",
        "Spring's `@Transactional` relies on dynamic AOP proxies; direct internal calls (`this.method()`) bypass the proxy wrapper, preventing transaction interception",
        "Database drivers require asynchronous dispatch to activate transaction locks",
        "Spring Security intercepts internal method calls and rejects unauthenticated threads"
      ],
      correctIndex: 1,
      explanation: "Spring wraps `@Transactional` beans in an AOP proxy. When an external caller invokes the bean, the call goes through the proxy which starts/commits the transaction. When a method calls another method on `this` within the same class, the call bypasses the proxy, and no transaction advice is executed."
    },
    {
      question: "Under high concurrent load with I/O-bound database operations, a Spring Boot 3 service on Java 21 experiences thread starvation. Which architectural feature in Spring Boot 3.2+ provides lightweight concurrency without rewriting code to reactive WebFlux?",
      options: [
        "Enabling Java 21 Virtual Threads (Project Loom) via `spring.threads.virtual.enabled=true`, allowing millions of lightweight threads to yield during blocking I/O",
        "Switching the embedded server to Apache Derby in-memory mode",
        "Increasing the operating system kernel stack size to 512MB per thread",
        "Disabling Hibernate second-level cache"
      ],
      correctIndex: 0,
      explanation: "Spring Boot 3.2+ fully supports Java 21 Virtual Threads via `spring.threads.virtual.enabled=true`. Virtual threads decouple Java threads from OS kernel threads, allowing blocking operations (like JDBC or REST client calls) to park the virtual thread without blocking an underlying OS carrier thread."
    },
    {
      question: "What is the security risk of configuring `@CrossOrigin(origins = \"*\")` on a Spring Boot REST API that uses session cookies or Authorization credentials?",
      options: [
        "Browsers will refuse to send requests with credentials (cookies, auth headers) when `Access-Control-Allow-Origin` is a wildcard `*`, and it leaves non-credentialed APIs open to unauthorized cross-origin requests",
        "Wildcard origins disable SSL/TLS encryption across client connections",
        "The embedded Tomcat server will automatically reboot upon receiving foreign origins",
        "Spring Security automatically purges all registered user accounts"
      ],
      correctIndex: 0,
      explanation: "Modern browsers adhere to the CORS specification: if `Access-Control-Allow-Credentials` is true, `Access-Control-Allow-Origin` cannot be a wildcard `*` (it will be blocked by browsers). Furthermore, allowing wildcard origins allows arbitrary third-party web origins to read response payloads from internal endpoints."
    },
    {
      question: "You need to externalize configuration across Dev, QA, and Production environments in Spring Boot. What is the standard idiom to activate environment-specific properties without modifying source code?",
      options: [
        "Hardcoding credentials in java files and commenting them out before deployment",
        "Creating `application-dev.yml` and `application-prod.yml`, and setting the active profile via the `SPRING_PROFILES_ACTIVE` environment variable or `-Dspring.profiles.active` argument",
        "Renaming `pom.xml` build artifacts dynamically in the target container",
        "Using `@Profile` on every single Spring bean constructor"
      ],
      correctIndex: 1,
      explanation: "Spring Boot profiles allow splitting environment-specific configurations into separate files (e.g., `application-prod.yml`). Setting the `SPRING_PROFILES_ACTIVE=prod` environment variable loads those overrides seamlessly without modifying application binaries."
    },
    {
      question: "In Spring Boot Actuator, why is it critical to restrict public exposure of endpoints such as `/actuator/env`, `/actuator/heapdump`, and `/actuator/beans`?",
      options: [
        "Actuator endpoints consume excessive CPU power and crash the server on every GET request",
        "They can leak sensitive environment variables, database credentials, API keys, and memory snapshots containing plain-text user secrets to unauthenticated attackers",
        "Actuator endpoints overwrite database tables with diagnostic metrics",
        "They disable TLS certificates for all HTTP requests"
      ],
      correctIndex: 1,
      explanation: "Actuator diagnostic endpoints expose comprehensive internal system state: `/env` reveals environment variables and property sources (often containing database passwords or secret keys), while `/heapdump` provides raw memory dumps that can expose decrypt keys and tokens. Only `/health` and `/info` should typically be public."
    }
  ],

  system_design: [
    {
      question: "You are designing a distributed cache cluster (such as Redis or Memcached) across 20 nodes. When scaling the cluster by adding or removing nodes, how does Consistent Hashing prevent massive cache invalidation?",
      options: [
        "It broadcasts every cached key to all 20 nodes simultaneously so no keys are ever lost",
        "It maps both cache keys and server nodes onto a virtual 360-degree hash ring; when a node is added or removed, only keys in the immediate adjacent ring segment are remapped (k/N keys on average)",
        "It maintains a single centralized master database that locks all read requests during node rebalancing",
        "It uses modulo hashing `hash(key) % N`, which automatically preserves all key mappings when N changes"
      ],
      correctIndex: 1,
      explanation: "In traditional modulo hashing (`hash(key) % N`), changing the node count N rehashes and moves virtually 100% of keys. Consistent Hashing maps keys and servers to a circular ring, ensuring adding or removing a node only redistributes ~1/N of keys, preventing massive cache miss thundering herds."
    },
    {
      question: "A high-profile social media account publishes a post that suddenly expires from the Redis cache. Millions of concurrent users immediately request the same post, overwhelming the downstream SQL database. What is this phenomenon called, and how is it mitigated?",
      options: [
        "Split-Brain condition; mitigated by adding additional secondary database replicas",
        "Cache Stampede (Thundering Herd); mitigated by using distributed mutex locks, probabilistic early expiration (XFetch), or background cache refreshing",
        "Deadlock condition; mitigated by killing active database connections",
        "Write-Behind failure; mitigated by disabling database indexes"
      ],
      correctIndex: 1,
      explanation: "Cache Stampede occurs when a high-traffic key expires, causing thousands of concurrent requests to experience a cache miss simultaneously and hammer the primary database to recompute it. Mutex locking (only one thread computes and repopulates the cache while others wait) or refreshing before expiration prevents this surge."
    },
    {
      question: "A globally distributed messaging service requires a distributed ID generator that produces 64-bit unique IDs that are roughly time-sortable without a centralized database coordinator. Which architecture meets these criteria?",
      options: [
        "Database AUTO_INCREMENT with two-phase commit across all international data centers",
        "Twitter Snowflake architecture: 1-bit sign, 41-bit timestamp, 10-bit machine/data center ID, and 12-bit sequence counter generated locally per node",
        "UUID version 4 randomly generated strings formatted as 128-bit hexadecimals",
        "MD5 hashing of the user's IP address combined with the current millisecond"
      ],
      correctIndex: 1,
      explanation: "Twitter Snowflake generates 64-bit IDs that fit in standard integers, are naturally ordered by timestamp (high bits), and generate millions of IDs per second per machine without inter-node network communication or centralized database bottlenecks."
    },
    {
      question: "In distributed systems, what fundamental trade-off does the CAP theorem articulate when a network partition (P) inevitably occurs?",
      options: [
        "The system can achieve infinite throughput by sacrificing security protocols",
        "The system must choose between Consistency (refusing or failing requests that cannot guarantee the latest write) and Availability (returning the most recent local data even if stale)",
        "The system must increase network bandwidth to eradicate latency entirely",
        "The system must switch to SQL databases to preserve both Consistency and Availability simultaneously"
      ],
      correctIndex: 1,
      explanation: "Network partitions (nodes unable to communicate across network cuts) are an unavoidable reality of distributed hardware. When a partition occurs, an architecture must choose whether to continue answering requests with potentially stale data (Availability) or reject requests until synchronization is verified (Consistency)."
    },
    {
      question: "An e-commerce order processing pipeline uses Apache Kafka for asynchronous communication between services. How does Kafka guarantee strict message order for orders placed by the same customer?",
      options: [
        "By setting total partitions to 1 across the entire Kafka cluster",
        "By publishing messages using the `customerId` as the partition key, ensuring all messages for that customer map to the same partition where order is guaranteed",
        "By enabling two-phase locking on every Kafka consumer thread",
        "By storing message logs in an external PostgreSQL relational database"
      ],
      correctIndex: 1,
      explanation: "Kafka guarantees strict FIFO ordering strictly within an individual partition, not across multiple partitions. By using `customerId` as the message key, Kafka's hash partitioner routes all events for that specific customer into the exact same partition, preserving sequence."
    },
    {
      question: "A ride-sharing application needs to store and query the real-time geographic locations of 500,000 active drivers to match them with nearby passengers. Which indexing data structure is most appropriate?",
      options: [
        "A standard B-Tree index on driver IDs",
        "A Spatial Index using Geospatial Hashing (Geohash) or a QuadTree / R-Tree to index 2D latitude and longitude bounding boxes",
        "A Singly Linked List of GPS coordinates sorted alphabetically by city name",
        "An in-memory Bloom Filter tracking active latitude numbers"
      ],
      correctIndex: 1,
      explanation: "Traditional 1D B-Tree indexes cannot efficiently execute 2D proximity bounding-box queries (finding coordinates within radius R). QuadTrees recursively subdivide 2D planes into quadrants, while Geohashes encode 2D coordinates into 1D hierarchical strings, allowing efficient spatial range scans."
    },
    {
      question: "You are designing an API Gateway that protects backend microservices from denial-of-service spikes. If a downstream service starts returning 500 errors or timing out, which architectural resilience pattern prevents cascading system failure?",
      options: [
        "The Circuit Breaker pattern (with Closed, Open, and Half-Open states) that trips after a threshold of failures, failing fast without overloading the downstream service",
        "The Singleton pattern ensuring only 1 client request is processed globally per minute",
        "The Write-Back pattern that saves failed HTTP requests into the user's browser cookie",
        "The Master-Slave database replication failover protocol"
      ],
      correctIndex: 0,
      explanation: "A Circuit Breaker monitors downstream failure rates. When failures exceed a threshold, it trips to 'Open', failing incoming calls immediately without consuming server threads or hammering the struggling dependency. After a cooldown, it moves to 'Half-Open' to probe if the service has recovered."
    },
    {
      question: "What is the key difference between Database Sharding and Read-Replication when scaling a relational database?",
      options: [
        "Read-replication divides write workloads across multiple disks while sharding only scales reads",
        "Read-replication copies data to multiple read-only instances to scale read queries, whereas Sharding partitions both read and write data across multiple distinct databases by a shard key to scale write capacity and storage",
        "Sharding is only possible on NoSQL databases like MongoDB and cannot be applied to PostgreSQL",
        "Read-replication removes the need for database backups entirely"
      ],
      correctIndex: 1,
      explanation: "Read replicas help when read volume exceeds single-node capacity, but all writes still flow to the single primary master. When data size or write throughput exceeds what a single machine can handle, Sharding partitions the entire dataset across separate database nodes using a shard key."
    }
  ],

  lld: [
    {
      question: "You are designing an e-commerce billing engine that supports multiple payment providers (Stripe, PayPal, UPI, NetBanking). The payment processing algorithm must be interchangeable at runtime without modifying the checkout class. Which design pattern should you apply?",
      options: [
        "Singleton Pattern, ensuring only one payment transaction occurs per application instance",
        "Strategy Pattern, defining a `PaymentStrategy` interface with concrete implementations and injecting the selected strategy into the `CheckoutService`",
        "Decorator Pattern, wrapping each payment method inside nested HTTP filters",
        "Prototype Pattern, cloning memory buffers of previous payments"
      ],
      correctIndex: 1,
      explanation: "The Strategy Pattern defines a family of algorithms, encapsulates each one inside a separate class, and makes them interchangeable. This adheres directly to the Open/Closed Principle: new payment options can be added without modifying the core checkout service."
    },
    {
      question: "According to the Single Responsibility Principle (SRP) in SOLID software design, how is a 'responsibility' defined?",
      options: [
        "A class must never contain more than one function or method",
        "A class should have only one reason to change, meaning it should only be responsible to a single actor or business stakeholder",
        "A class should only be accessed by one thread at any given time",
        "A class must contain zero external dependencies or imports"
      ],
      correctIndex: 1,
      explanation: "As formulated by Robert C. Martin, SRP states that a module or class should be responsible to one, and only one, actor or stakeholder. For example, a class that calculates payroll (accounting) should not also be responsible for formatting PDF reports (presentation) or writing to SQL (persistence)."
    },
    {
      question: "In a document rendering application, you need to add dynamic capabilities (such as encryption, watermark stamping, and compression) to text streams in arbitrary combinations without subclass explosion. Which design pattern solves this?",
      options: [
        "Decorator Pattern, wrapping the core stream component in decorator classes that implement the same interface and augment behavior dynamically",
        "Abstract Factory Pattern, creating separate document classes for every possible permutation",
        "Flyweight Pattern, sharing character glyphs across text paragraphs",
        "Adapter Pattern, converting incompatible stream interfaces to socket connections"
      ],
      correctIndex: 0,
      explanation: "The Decorator Pattern attaches additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality, allowing chaining (e.g. `new EncryptedStream(new WatermarkedStream(new FileStream()))`) without creating dozens of combinatorial classes."
    },
    {
      question: "What is the primary architectural hazard of the Observer Pattern in languages with garbage collection (like Java or C#), and how is it prevented?",
      options: [
        "Subject notifications cause CPU registers to freeze during loop execution",
        "The 'Lapsed Listener' problem: registered observers retain strong references from the subject, preventing garbage collection and causing memory leaks; prevented by using Weak References or explicit unsubscribe lifecycles",
        "Observers cannot process data asynchronously without hardware GPU support",
        "The subject is forced to convert all notifications into JSON strings"
      ],
      correctIndex: 1,
      explanation: "When an observer registers with a long-lived subject, the subject holds a strong reference to it. If the client discards the observer without calling `unsubscribe()`, the garbage collector cannot reclaim it, leading to silent memory leaks. Using `WeakReference` or explicit unsubscribe hooks resolves this."
    },
    {
      question: "You are implementing a thread-safe Singleton pattern in Java. Why is Double-Checked Locking with a `volatile` keyword required rather than simple synchronized method access?",
      options: [
        "Synchronizing the entire `getInstance()` method incurs unnecessary synchronization overhead on every subsequent read after initialization; `volatile` prevents CPU instruction reordering during instance construction",
        "Simple synchronization causes deadlock on multi-core processors",
        "The JVM does not support thread synchronization inside static methods",
        "The `volatile` keyword automatically serializes the instance to disk"
      ],
      correctIndex: 0,
      explanation: "Synchronizing `getInstance()` creates a performance bottleneck because 99.9% of calls only read the already-initialized instance. Double-checked locking checks without locks first. The `volatile` modifier is critical because it prevents compiler/CPU instruction reordering where a partially-constructed object reference is published before fields finish initializing."
    },
    {
      question: "How does the Dependency Inversion Principle (DIP) differ from standard Dependency Injection (DI)?",
      options: [
        "DIP is a high-level design principle stating that high-level modules should depend on abstractions rather than low-level details, whereas DI is a concrete creational technique to provide dependencies to objects",
        "DIP only applies to frontend TypeScript apps while DI only applies to Java Spring",
        "DI requires manual XML configuration while DIP requires JSON files",
        "They are completely identical terms with no distinction"
      ],
      correctIndex: 0,
      explanation: "Dependency Inversion is a high-level architectural rule ('Depend on abstractions, not concretions'). Dependency Injection (DI) is a specific design pattern and technique used to fulfill that principle (by passing implementations in via constructors or containers rather than having the class instantiate them directly)."
    },
    {
      question: "When designing an undo/redo manager for a collaborative diagram editor, which design pattern encapsulates all actions (insert shape, delete shape, move shape) as discrete objects with execute and undo methods?",
      options: [
        "Command Pattern",
        "Composite Pattern",
        "Bridge Pattern",
        "Facade Pattern"
      ],
      correctIndex: 0,
      explanation: "The Command Pattern encapsulates a request as an object, thereby parameterizing clients with different requests, queue or log requests, and support undoable operations by storing previous state and executing reciprocal undo methods."
    },
    {
      question: "An analytics service needs to traverse complex hierarchical company organizational structures (employees, teams, departments, business units) uniformly to compute total headcount. Which design pattern should be applied?",
      options: [
        "Composite Pattern, treating individual leaf nodes (employees) and composite branches (departments containing employees/teams) uniformly through a common component interface",
        "Flyweight Pattern, sharing employee memory allocations across departments",
        "Proxy Pattern, restricting access to private organizational records",
        "Builder Pattern, assembling department objects step-by-step"
      ],
      correctIndex: 0,
      explanation: "The Composite Pattern composes objects into tree structures to represent part-whole hierarchies. Composite lets clients treat individual objects and compositions of objects uniformly, allowing a single recursive `getHeadcount()` call to traverse employees and multi-tier departments identically."
    }
  ]
};
