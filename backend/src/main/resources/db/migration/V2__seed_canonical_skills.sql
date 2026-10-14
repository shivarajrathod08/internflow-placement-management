-- ==========================================================
-- INTERNFLOW V2: CANONICAL SKILLS DICTIONARY & ALIASES
-- ==========================================================

-- 1. Languages & Backend
INSERT INTO skills (id, canonical_name, category, description) VALUES
(1, 'Java', 'Backend', 'Object-oriented programming language for enterprise software'),
(2, 'Spring Boot', 'Backend', 'Java-based framework used to create microservices and web apps'),
(3, 'Python', 'Backend', 'High-level versatile programming language'),
(4, 'Django', 'Backend', 'Python web framework for rapid development'),
(5, 'FastAPI', 'Backend', 'Modern, fast web framework for building APIs with Python'),
(6, 'Node.js', 'Backend', 'JavaScript runtime built on Chrome V8 engine'),
(7, 'Express.js', 'Backend', 'Fast, unopinionated web framework for Node.js'),
(8, 'Go', 'Backend', 'Statically typed, compiled programming language by Google'),
(9, 'C++', 'Backend', 'General-purpose systems programming language'),
(10, 'C#', 'Backend', 'Modern object-oriented language developed by Microsoft'),
(11, '.NET Core', 'Backend', 'Cross-platform framework for building cloud apps'),
(12, 'Rust', 'Backend', 'Systems programming language focused on safety and speed');

-- 2. Frontend & Web
INSERT INTO skills (id, canonical_name, category, description) VALUES
(13, 'JavaScript', 'Frontend', 'High-level language that conforms to ECMAScript standard'),
(14, 'TypeScript', 'Frontend', 'Strongly typed programming language that builds on JavaScript'),
(15, 'React', 'Frontend', 'JavaScript library for building user interfaces'),
(16, 'Next.js', 'Frontend', 'React framework for server-side rendering and static sites'),
(17, 'Vue.js', 'Frontend', 'Progressive JavaScript framework for building UIs'),
(18, 'Angular', 'Frontend', 'TypeScript-based open-source web application framework'),
(19, 'Tailwind CSS', 'Frontend', 'Utility-first CSS framework for rapid UI development'),
(20, 'HTML5', 'Frontend', 'Standard markup language for documents designed for web browsers'),
(21, 'CSS3', 'Frontend', 'Style sheet language used for describing presentation of HTML');

-- 3. Databases & Caches
INSERT INTO skills (id, canonical_name, category, description) VALUES
(22, 'MySQL', 'Database', 'Open-source relational database management system'),
(23, 'PostgreSQL', 'Database', 'Powerful, open source object-relational database system'),
(24, 'MongoDB', 'Database', 'Source-available cross-platform document-oriented database'),
(25, 'Redis', 'Database', 'In-memory data structure store used as a database and cache'),
(26, 'Elasticsearch', 'Database', 'Distributed, RESTful search and analytics engine'),
(27, 'Apache Kafka', 'Database', 'Distributed event streaming platform for high-performance data pipelines');

-- 4. Cloud, DevOps & Infrastructure
INSERT INTO skills (id, canonical_name, category, description) VALUES
(28, 'Docker', 'DevOps', 'Set of platform as a service products using OS-level virtualization'),
(29, 'Kubernetes', 'DevOps', 'Open-source system for automating deployment, scaling of containerized apps'),
(30, 'AWS', 'Cloud', 'Amazon Web Services cloud computing platform'),
(31, 'Google Cloud Platform', 'Cloud', 'Suite of cloud computing services by Google'),
(32, 'Microsoft Azure', 'Cloud', 'Cloud computing platform run by Microsoft'),
(33, 'Git', 'DevOps', 'Distributed version control system for tracking changes in source code'),
(34, 'CI/CD', 'DevOps', 'Continuous integration and continuous deployment pipelines'),
(35, 'Linux', 'DevOps', 'Open-source Unix-like operating system kernel');

-- 5. AI, ML & Data
INSERT INTO skills (id, canonical_name, category, description) VALUES
(36, 'Machine Learning', 'AI/ML', 'Study of computer algorithms that improve automatically through experience'),
(37, 'Deep Learning', 'AI/ML', 'Part of a broader family of machine learning methods based on neural networks'),
(38, 'TensorFlow', 'AI/ML', 'End-to-end open source platform for machine learning'),
(39, 'PyTorch', 'AI/ML', 'Open source machine learning framework based on Torch library'),
(40, 'Pandas', 'AI/ML', 'Python data analysis and manipulation tool');

-- Aliases for Normalization
INSERT INTO skill_aliases (skill_id, alias_name) VALUES
(1, 'java'),
(1, 'JAVA'),
(1, 'Java SE'),
(1, 'Core Java'),
(2, 'spring boot'),
(2, 'Spring'),
(2, 'Spring Boot 3'),
(2, 'Spring Framework'),
(3, 'python'),
(3, 'python3'),
(3, 'Python 3'),
(6, 'nodejs'),
(6, 'node'),
(6, 'NodeJS'),
(13, 'javascript'),
(13, 'JS'),
(13, 'ES6'),
(14, 'typescript'),
(14, 'TS'),
(15, 'react'),
(15, 'react.js'),
(15, 'ReactJS'),
(15, 'React.js'),
(19, 'tailwind'),
(19, 'tailwindcss'),
(22, 'mysql'),
(22, 'MySQL 8'),
(23, 'postgres'),
(23, 'postgresql'),
(23, 'Postgres'),
(25, 'redis'),
(27, 'kafka'),
(27, 'Kafka'),
(28, 'docker'),
(29, 'k8s'),
(29, 'kubernetes'),
(30, 'aws'),
(30, 'Amazon Web Services'),
(31, 'gcp'),
(31, 'GCP'),
(33, 'git'),
(33, 'GitHub'),
(35, 'linux'),
(35, 'Ubuntu');
