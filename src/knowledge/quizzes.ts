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
      question: "You are given an unsorted array of N integers containing both positive and negative values. You need to determine the maximum sum of any contiguous subarray in O(N) time and O(1) auxiliary space. Which algorithm or technique should you use?",
      options: [
        "Kadane's Algorithm",
        "Floyd-Warshall Algorithm",
        "Divide-and-Conquer Strassen's Algorithm",
        "Sieve of Eratosthenes"
      ],
      correctIndex: 0,
      explanation: "Kadane's Algorithm maintains a running sum of the maximum subarray ending at the current position (curr = max(x, curr + x)), updating the global maximum in linear O(N) time and O(1) auxiliary space."
    },
    {
      question: "You are given an array of N integers that is already sorted in ascending order and a target value T. You must determine whether any two numbers add up to T in O(N) time while strictly using O(1) auxiliary space. Which algorithmic technique is optimal?",
      options: [
        "Hash Map storing seen complements",
        "Two Pointers placed at opposite ends (left and right), moving inward based on whether the current sum is less than or greater than T",
        "Breadth-First Search on a state transition graph",
        "Dynamic programming with an N × T table"
      ],
      correctIndex: 1,
      explanation: "Because the array is already sorted, converging Two Pointers from both ends runs in O(N) time and requires strictly O(1) auxiliary space. A Hash Map also takes O(N) time but incurs O(N) extra memory."
    },
    {
      question: "What is the tight worst-case time complexity of the optimal Two-Pointer approach to solve the 3Sum problem (finding all unique triplets [a, b, c] such that a + b + c = 0 in an unsorted array of N elements)?",
      options: [
        "O(N log N)",
        "O(N³)",
        "O(N²)",
        "O(N)"
      ],
      correctIndex: 2,
      explanation: "Sorting the array takes O(N log N). Iterating through each index and running a two-pointer search on the remainder takes O(N) per index, yielding O(N log N + N²) = O(N²) total time."
    },
    {
      question: "Given a string of length N and an integer K, you must find the length of the longest substring containing at most K distinct characters in optimal O(N) time. Which technique should you use?",
      options: [
        "Variable-size Sliding Window with two pointers and a character frequency map",
        "Monotonic Stack popping smaller characters",
        "Recursive Backtracking generating all substring combinations",
        "Dijkstra's Shortest Path algorithm"
      ],
      correctIndex: 0,
      explanation: "A variable-size Sliding Window expands the right pointer to include characters and contracts the left pointer whenever the distinct character count exceeds K, visiting each element at most twice for O(N) total time."
    },
    {
      question: "What is the tight worst-case time complexity of constructing a binary heap (bottom-up heapify or Floyd's build-heap algorithm) from an unsorted array of N elements?",
      options: [
        "O(N log N)",
        "O(N)",
        "O(log N)",
        "O(N²)"
      ],
      correctIndex: 1,
      explanation: "Inserting N elements one by one takes O(N log N). However, Floyd's bottom-up heapify runs siftDown starting from the lowest internal nodes. Summing node heights (N/4 · 1 + N/8 · 2 + ...) mathematically converges to O(N) linear time."
    },
    {
      question: "You are given an array of daily temperatures. For each day, you need to find how many days you would have to wait until a warmer temperature occurs (Next Greater Element variant). To achieve an optimal O(N) total time complexity, which data structure pattern should you implement?",
      options: [
        "Balanced Binary Search Tree",
        "Max-Heap / Priority Queue updated on every day",
        "Circular FIFO Queue",
        "Monotonic Decreasing Stack storing indices of unresolved temperatures"
      ],
      correctIndex: 3,
      explanation: "A Monotonic Decreasing Stack stores indices of temperatures waiting for a warmer day. When a warmer temperature is encountered, unresolved indices are popped. Each index is pushed and popped at most once, yielding O(N) time."
    },
    {
      question: "What is the time complexity to search for a target value in a sorted array of N distinct integers that has been rotated at an unknown pivot index?",
      options: [
        "O(log N)",
        "O(N)",
        "O(1)",
        "O(N log N)"
      ],
      correctIndex: 0,
      explanation: "At any midpoint, at least one half of the rotated array is guaranteed to be strictly sorted. By checking if the target lies within the boundaries of the sorted half, modified Binary Search eliminates half the search space each step in O(log N) time."
    },
    {
      question: "You are designing a build pipeline that compiles thousands of software modules with interdependencies. You need to verify if the dependency graph contains circular dependencies, and if not, produce a valid sequential build order. Which algorithm should you run?",
      options: [
        "Kruskal's Minimum Spanning Tree algorithm",
        "Topological Sort using Kahn's Algorithm (in-degree tracking via BFS) or DFS with 3-color cycle detection",
        "Floyd-Warshall all-pairs shortest path",
        "QuickSelect partitioning"
      ],
      correctIndex: 1,
      explanation: "Dependency graphs are Directed Acyclic Graphs (DAGs). Kahn's Algorithm computes vertex in-degrees and enqueues nodes with in-degree 0. If processed vertices < total vertices, a cycle is detected. Otherwise, the processing sequence is a valid topological sort."
    },
    {
      question: "In a Hash Table that resolves collisions using separate chaining with singly linked lists, what is the worst-case time complexity of searching for an existing key when N elements are stored in the table?",
      options: [
        "O(1)",
        "O(log N)",
        "O(N)",
        "O(N²)"
      ],
      correctIndex: 2,
      explanation: "Under uniform hashing, average lookup is O(1). However, in the worst case (e.g. hash collision attack or degenerate hash function), all N keys hash to the same bucket, creating a single linked list of length N that takes O(N) time to traverse."
    },
    {
      question: "You need to determine whether a singly linked list contains a cycle and locate the node where the cycle starts using strictly O(1) auxiliary memory without modifying node values. Which algorithm satisfies these requirements?",
      options: [
        "Floyd's Cycle-Finding Algorithm (Tortoise and Hare two pointers)",
        "Breadth-First Search with an in-memory visited Set",
        "Binary Search on node memory pointers",
        "Topological Sort"
      ],
      correctIndex: 0,
      explanation: "Floyd's algorithm uses a slow pointer (1 step) and fast pointer (2 steps). If they meet, a cycle exists. Resetting one pointer to head and moving both at 1 step locates the cycle start in O(N) time and O(1) space."
    },
    {
      question: "What is the time complexity of Dijkstra's single-source shortest path algorithm on a graph with V vertices and E edges with non-negative weights, implemented using an adjacency list and a binary min-heap?",
      options: [
        "O(V²)",
        "O((V + E) log V)",
        "O(V · E)",
        "O(E log E + V²)"
      ],
      correctIndex: 1,
      explanation: "Each vertex is extracted from the binary min-heap at most once (V log V), and each edge relaxation can result in a priority queue update/push (E log V), yielding a total time of O((V + E) log V)."
    },
    {
      question: "You are given an integer array containing both positive and negative numbers, and an integer K. You need to count the total number of continuous subarrays whose sum equals K in O(N) time. Which technique should you use?",
      options: [
        "Fixed-size Sliding Window",
        "Two Pointers converging from opposite ends",
        "Prefix Sum combined with a Hash Map storing frequencies of cumulative sums",
        "Greedy selection of maximum elements"
      ],
      correctIndex: 2,
      explanation: "Because numbers can be negative, subarray sums are not monotonic, so two pointers or sliding windows fail. Storing cumulative prefix sums in a Hash Map allows checking if (prefixSum - K) has been seen in O(1) per element, solving the problem in O(N) time."
    },
    {
      question: "What is the tight time complexity of finding the Next Greater Element for all N elements in an array using a Monotonic Stack?",
      options: [
        "O(N)",
        "O(N²)",
        "O(N log N)",
        "O(log N)"
      ],
      correctIndex: 0,
      explanation: "Although there is a while loop inside the iteration, each element is pushed onto the stack exactly once and popped at most once across the entire algorithm, making the amortized total time strictly O(N)."
    },
    {
      question: "You are required to find the K-th smallest element in an unsorted array of N elements in O(N) average time without sorting the entire array. Which algorithm should you apply?",
      options: [
        "MergeSort with early termination",
        "QuickSelect (Hoare's Selection Algorithm)",
        "Binary Search on array indices",
        "Kruskal's Algorithm"
      ],
      correctIndex: 1,
      explanation: "QuickSelect uses the partition step of QuickSort. Instead of recursing into both sides, it recurses only into the partition containing the K-th index, achieving an average time complexity of O(N)."
    },
    {
      question: "What is the amortized time complexity per operation for Disjoint Set Union (DSU) when both Path Compression and Union by Rank heuristics are implemented?",
      options: [
        "O(log N)",
        "O(N)",
        "O(α(N)), where α is the Inverse Ackermann function (effectively O(1))",
        "O(1) strictly worst-case"
      ],
      correctIndex: 2,
      explanation: "With both path compression and union by rank, any sequence of M operations on N elements takes O(M · α(N)) time, where α is the inverse Ackermann function, which is practically bounded by 4 for all realistic inputs."
    },
    {
      question: "What is the time complexity to search for a word of length L in a Trie (Prefix Tree) that contains N total words and M total characters?",
      options: [
        "O(L)",
        "O(N)",
        "O(M)",
        "O(log N)"
      ],
      correctIndex: 0,
      explanation: "Searching in a Trie requires following one pointer per character of the query word. The operation takes O(L) time where L is the length of the query word, completely independent of the total number of words N stored in the Trie."
    },
    {
      question: "You are designing a service that ingests a continuous real-time stream of numeric values. The service must support inserting incoming numbers in O(log N) time and retrieving the exact running median in O(1) time. Which technique should you implement?",
      options: [
        "A sorted dynamic array with binary search insertion",
        "Two Heaps: a Max-Heap for the lower half and a Min-Heap for the upper half, kept balanced in size",
        "A Hash Table storing running counts",
        "A Monotonic Stack"
      ],
      correctIndex: 1,
      explanation: "Maintaining a Max-Heap for the smaller half of numbers and a Min-Heap for the larger half allows extracting the median from the root(s) in O(1) time while each insertion takes O(log N) heap balance time."
    },
    {
      question: "What is the time complexity of the optimal algorithm to find the length of the Longest Increasing Subsequence (LIS) in an unsorted array of N numbers using Patience Sorting?",
      options: [
        "O(N²)",
        "O(N log N)",
        "O(N)",
        "O(2^N)"
      ],
      correctIndex: 1,
      explanation: "Simple DP takes O(N²). Patience sorting maintains a tails array where tails[i] stores the smallest tail of all increasing subsequences of length i+1. Using binary search to update tails for each element yields O(N log N) time."
    },
    {
      question: "You are given an undirected graph and a continuous stream of incoming edge connections. You need to determine whether adding each edge creates a cycle or connects two previously disconnected components in near-constant time. Which data structure should you use?",
      options: [
        "Adjacency Matrix with BFS traversal after each edge",
        "Binary Search Tree",
        "Disjoint Set Union (DSU / Union-Find)",
        "Segment Tree"
      ],
      correctIndex: 2,
      explanation: "Disjoint Set Union tracks connected components. If find(u) == find(v) before unioning, adding edge (u, v) creates a cycle. Otherwise, union(u, v) merges the sets in near O(1) amortized time."
    },
    {
      question: "What is the auxiliary space complexity of finding the longest substring without repeating characters in a string of length N over an alphabet of size Σ (e.g. ASCII or Unicode) using the Sliding Window pattern with a hash map?",
      options: [
        "O(min(N, |Σ|))",
        "O(N²)",
        "O(1) strictly for all arbitrary alphabets",
        "O(N log N)"
      ],
      correctIndex: 0,
      explanation: "The sliding window hash map stores at most one entry per unique character currently present within the window. The number of keys is bounded both by the string length N and the total unique alphabet size |Σ|, giving O(min(N, |Σ|)) auxiliary space."
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
