-- Seed initial skills data
INSERT INTO skills (id, name, category, description) VALUES
-- Programming Languages
(gen_random_uuid(), 'JavaScript', 'Programming Languages', 'Modern web development language'),
(gen_random_uuid(), 'Python', 'Programming Languages', 'Versatile programming language for web, data science, and automation'),
(gen_random_uuid(), 'Java', 'Programming Languages', 'Enterprise-level programming language'),
(gen_random_uuid(), 'TypeScript', 'Programming Languages', 'Typed superset of JavaScript'),
(gen_random_uuid(), 'Rust', 'Programming Languages', 'Systems programming language focused on safety and performance'),
(gen_random_uuid(), 'Go', 'Programming Languages', 'Google''s programming language for concurrent systems'),
(gen_random_uuid(), 'C++', 'Programming Languages', 'High-performance systems programming'),
(gen_random_uuid(), 'C#', 'Programming Languages', 'Microsoft''s object-oriented programming language'),

-- Frontend Technologies
(gen_random_uuid(), 'React', 'Frontend', 'Popular JavaScript library for building user interfaces'),
(gen_random_uuid(), 'Vue.js', 'Frontend', 'Progressive JavaScript framework'),
(gen_random_uuid(), 'Angular', 'Frontend', 'TypeScript-based web framework'),
(gen_random_uuid(), 'Next.js', 'Frontend', 'React framework for production'),
(gen_random_uuid(), 'HTML5', 'Frontend', 'Latest HTML standard'),
(gen_random_uuid(), 'CSS3', 'Frontend', 'Latest CSS standard'),
(gen_random_uuid(), 'Tailwind CSS', 'Frontend', 'Utility-first CSS framework'),

-- Backend Technologies
(gen_random_uuid(), 'Node.js', 'Backend', 'JavaScript runtime for server-side development'),
(gen_random_uuid(), 'Express.js', 'Backend', 'Web framework for Node.js'),
(gen_random_uuid(), 'Django', 'Backend', 'High-level Python web framework'),
(gen_random_uuid(), 'FastAPI', 'Backend', 'Modern Python web framework'),
(gen_random_uuid(), 'Spring Boot', 'Backend', 'Java framework for building applications'),
(gen_random_uuid(), 'ASP.NET Core', 'Backend', 'Cross-platform .NET framework'),

-- Databases
(gen_random_uuid(), 'PostgreSQL', 'Database', 'Advanced open-source relational database'),
(gen_random_uuid(), 'MySQL', 'Database', 'Popular open-source relational database'),
(gen_random_uuid(), 'MongoDB', 'Database', 'NoSQL document database'),
(gen_random_uuid(), 'Redis', 'Database', 'In-memory data structure store'),
(gen_random_uuid(), 'SQLite', 'Database', 'Embedded relational database'),

-- DevOps & Tools
(gen_random_uuid(), 'Docker', 'DevOps', 'Containerization platform'),
(gen_random_uuid(), 'Kubernetes', 'DevOps', 'Container orchestration platform'),
(gen_random_uuid(), 'Git', 'DevOps', 'Version control system'),
(gen_random_uuid(), 'CI/CD', 'DevOps', 'Continuous Integration/Deployment'),
(gen_random_uuid(), 'AWS', 'Cloud', 'Amazon Web Services cloud platform'),
(gen_random_uuid(), 'Azure', 'Cloud', 'Microsoft Azure cloud platform'),
(gen_random_uuid(), 'Google Cloud', 'Cloud', 'Google Cloud Platform'),

-- Data Science & AI
(gen_random_uuid(), 'Machine Learning', 'Data Science', 'AI and ML algorithms'),
(gen_random_uuid(), 'TensorFlow', 'Data Science', 'Machine learning framework'),
(gen_random_uuid(), 'PyTorch', 'Data Science', 'Deep learning framework'),
(gen_random_uuid(), 'Data Analysis', 'Data Science', 'Statistical data analysis'),
(gen_random_uuid(), 'Pandas', 'Data Science', 'Python data manipulation library'),

-- Soft Skills
(gen_random_uuid(), 'Communication', 'Soft Skills', 'Effective communication abilities'),
(gen_random_uuid(), 'Teamwork', 'Soft Skills', 'Collaboration and team cooperation'),
(gen_random_uuid(), 'Problem Solving', 'Soft Skills', 'Analytical and critical thinking'),
(gen_random_uuid(), 'Leadership', 'Soft Skills', 'Team leadership and management')
ON CONFLICT (name) DO NOTHING;
