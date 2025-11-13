-- Seed data for CareerBridge application
-- This file contains sample data for testing and development

-- Insert sample jobs
INSERT INTO jobs (job_title, company, location, job_description, required_skills, experience_level, job_type, salary_min, salary_max) VALUES
('Frontend Developer', 'Tech Solutions Inc', 'Remote', 'We are seeking a talented Frontend Developer to join our dynamic team. You will be responsible for building responsive and user-friendly web applications using modern JavaScript frameworks. Collaborate with designers and backend developers to create seamless user experiences.', ARRAY['JavaScript', 'React', 'CSS', 'HTML'], 'junior', 'full_time', 60000, 80000),
('Full Stack Developer', 'Innovation Labs', 'New York, NY', 'Join our innovative team as a Full Stack Developer! You will work on cutting-edge projects, developing both frontend and backend solutions. Experience with modern web technologies and cloud platforms is essential. Great opportunity for growth and learning.', ARRAY['JavaScript', 'Node.js', 'React', 'PostgreSQL', 'Docker'], 'mid', 'full_time', 90000, 120000),
('Junior Web Developer', 'Startup Hub', 'San Francisco, CA', 'Start your career with us! This internship offers hands-on experience building real web applications. Learn from experienced developers while working on exciting startup projects. Perfect for recent graduates or career changers.', ARRAY['HTML', 'CSS', 'JavaScript'], 'fresher', 'internship', 20000, 30000),
('React Developer', 'Digital Agency', 'Austin, TX', 'We need a React specialist to build modern, performant web applications for our diverse client base. You will work with the latest React ecosystem tools and best practices. Strong communication skills and attention to detail required.', ARRAY['React', 'JavaScript', 'TypeScript', 'Redux'], 'junior', 'full_time', 65000, 85000),
('Backend Developer', 'Cloud Systems', 'Seattle, WA', 'Looking for an experienced Backend Developer to architect and implement scalable server-side solutions. Work with microservices, databases, and cloud infrastructure. Join a team that values code quality and continuous improvement.', ARRAY['Node.js', 'Python', 'PostgreSQL', 'AWS'], 'mid', 'full_time', 95000, 130000),
('Data Analyst', 'Analytics Corp', 'Boston, MA', 'Analyze complex datasets to drive business decisions. Create insightful reports and dashboards using Python and visualization tools. Work closely with stakeholders to understand their data needs and deliver actionable insights.', ARRAY['Python', 'SQL', 'Pandas', 'Excel', 'Tableau'], 'junior', 'full_time', 55000, 75000),
('Junior Data Scientist', 'AI Innovations', 'Remote', 'Exciting opportunity to start your data science career! Work on machine learning projects, conduct statistical analysis, and help build predictive models. Mentorship provided by senior data scientists. Perfect for those passionate about AI and data.', ARRAY['Python', 'Machine Learning', 'Statistics', 'SQL'], 'fresher', 'internship', 25000, 35000),
('Data Engineer', 'BigData Solutions', 'Chicago, IL', 'Build and maintain robust data pipelines and ETL processes. Work with big data technologies to process and transform large-scale datasets. Ensure data quality and optimize performance for analytics workloads.', ARRAY['Python', 'SQL', 'Apache Spark', 'AWS', 'ETL'], 'mid', 'full_time', 100000, 135000),
('UI/UX Designer', 'Creative Studio', 'Los Angeles, CA', 'Design beautiful and intuitive user interfaces for web and mobile applications. Conduct user research, create wireframes and prototypes, and work closely with developers to bring designs to life. Portfolio required.', ARRAY['Figma', 'Adobe XD', 'Sketch', 'User Research'], 'junior', 'full_time', 60000, 80000),
('Graphic Designer', 'Marketing Agency', 'Miami, FL', 'Create stunning visual content for various marketing campaigns. Design logos, social media graphics, and promotional materials. Collaborate with the marketing team to deliver creative solutions that meet client objectives.', ARRAY['Adobe Photoshop', 'Illustrator', 'InDesign', 'Branding'], 'fresher', 'part_time', 30000, 40000),
('Product Designer', 'Tech Products Co', 'San Diego, CA', 'Lead the design of innovative product features from concept to launch. Create and maintain design systems, conduct user testing, and iterate based on feedback. Work in a collaborative environment with product managers and engineers.', ARRAY['Figma', 'Prototyping', 'User Testing', 'Design Systems'], 'mid', 'full_time', 85000, 110000),
('Digital Marketing Specialist', 'Growth Marketing', 'Denver, CO', 'Drive online growth through comprehensive digital marketing strategies. Manage SEO campaigns, analyze web traffic, and create engaging content. Help businesses reach their target audience and achieve their marketing goals.', ARRAY['SEO', 'Google Analytics', 'Content Marketing', 'Social Media'], 'junior', 'full_time', 50000, 70000),
('Social Media Manager', 'Brand Agency', 'Portland, OR', 'Build and engage online communities for exciting brands. Create compelling social media content, monitor trends, and analyze performance metrics. Great opportunity for creative storytellers passionate about social media.', ARRAY['Social Media Strategy', 'Content Creation', 'Analytics', 'Copywriting'], 'fresher', 'part_time', 25000, 35000),
('Marketing Analyst', 'E-commerce Giant', 'Remote', 'Leverage data to optimize marketing campaigns and improve ROI. Conduct A/B tests, create dashboards, and provide actionable recommendations. Work with cross-functional teams in a fast-paced e-commerce environment.', ARRAY['Google Analytics', 'Excel', 'SQL', 'A/B Testing', 'Data Visualization'], 'junior', 'full_time', 55000, 75000),
('Content Marketing Manager', 'SaaS Company', 'Nashville, TN', 'Develop and execute content strategies that drive customer acquisition and engagement. Create blog posts, whitepapers, and email campaigns. Manage content calendar and measure content performance. SEO expertise essential.', ARRAY['Content Strategy', 'SEO', 'Copywriting', 'Email Marketing'], 'mid', 'full_time', 75000, 95000),
('Web Designer', 'Design Collective', 'Philadelphia, PA', 'Design modern, responsive websites for diverse clients. Transform ideas into beautiful web experiences using the latest design tools and front-end technologies. Freelance role with flexible hours and competitive rates.', ARRAY['HTML', 'CSS', 'Figma', 'Responsive Design', 'WordPress'], 'junior', 'freelance', NULL, NULL),
('Python Developer', 'FinTech Startup', 'Remote', 'Build secure and scalable financial applications using Python and Django. Work on RESTful APIs, integrate payment systems, and ensure code quality. Join a startup that is revolutionizing personal finance.', ARRAY['Python', 'Django', 'REST APIs', 'PostgreSQL'], 'junior', 'full_time', 70000, 90000),
('DevOps Engineer', 'Cloud Infrastructure', 'Dallas, TX', 'Automate infrastructure and streamline deployment processes. Manage containerized applications, implement CI/CD pipelines, and monitor system performance. Work with cutting-edge cloud technologies in a collaborative team.', ARRAY['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'], 'mid', 'full_time', 95000, 125000),
('QA Engineer', 'Software Testing Co', 'Atlanta, GA', 'Learn software testing from the ground up! Create test plans, execute manual and automated tests, and report bugs. Great internship for detail-oriented individuals looking to start a career in quality assurance.', ARRAY['Manual Testing', 'Selenium', 'JavaScript', 'Test Automation'], 'fresher', 'internship', 22000, 32000),
('Business Analyst', 'Consulting Firm', 'Washington DC', 'Bridge the gap between business needs and technical solutions. Gather requirements, create documentation, and work with development teams. Experience with Agile methodologies and strong analytical skills required.', ARRAY['Requirements Gathering', 'SQL', 'Excel', 'Agile', 'Documentation'], 'junior', 'full_time', 60000, 80000);

-- Insert sample learning resources
INSERT INTO learning_resources (title, platform, url, related_skills, cost) VALUES
-- Web Development
('Complete Web Development Bootcamp', 'Udemy', 'https://udemy.com/web-dev', ARRAY['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'], 'paid'),
('JavaScript - The Complete Guide', 'Udemy', 'https://udemy.com/javascript', ARRAY['JavaScript', 'ES6', 'DOM', 'Async'], 'paid'),
('React - The Complete Guide', 'Udemy', 'https://udemy.com/react', ARRAY['React', 'Hooks', 'Redux', 'Next.js'], 'paid'),
('freeCodeCamp Web Development', 'freeCodeCamp', 'https://freecodecamp.org', ARRAY['HTML', 'CSS', 'JavaScript', 'React'], 'free'),
('The Odin Project', 'The Odin Project', 'https://theodinproject.com', ARRAY['HTML', 'CSS', 'JavaScript', 'Node.js', 'Git'], 'free'),
('Node.js - The Complete Guide', 'Udemy', 'https://udemy.com/nodejs', ARRAY['Node.js', 'Express', 'MongoDB', 'REST APIs'], 'paid'),
('TypeScript Fundamentals', 'Pluralsight', 'https://pluralsight.com/typescript', ARRAY['TypeScript', 'JavaScript', 'Type Systems'], 'paid'),
('CSS Grid and Flexbox', 'Scrimba', 'https://scrimba.com/css', ARRAY['CSS', 'Responsive Design', 'Layout'], 'free'),

-- Data Science & Analytics
('Python for Data Science', 'Coursera', 'https://coursera.org/python-data', ARRAY['Python', 'Pandas', 'NumPy', 'Matplotlib'], 'paid'),
('Machine Learning Specialization', 'Coursera', 'https://coursera.org/ml', ARRAY['Machine Learning', 'Python', 'TensorFlow', 'Deep Learning'], 'paid'),
('SQL for Data Analysis', 'Udacity', 'https://udacity.com/sql', ARRAY['SQL', 'Database Design', 'Data Analysis'], 'free'),
('Data Analysis with Python', 'freeCodeCamp', 'https://freecodecamp.org/data-analysis', ARRAY['Python', 'Pandas', 'Data Visualization', 'NumPy'], 'free'),
('Statistics for Data Science', 'Khan Academy', 'https://khanacademy.org/statistics', ARRAY['Statistics', 'Probability', 'Data Analysis'], 'free'),
('Tableau Fundamentals', 'Tableau', 'https://tableau.com/learn', ARRAY['Tableau', 'Data Visualization', 'Dashboards'], 'free'),
('Excel Skills for Business', 'Coursera', 'https://coursera.org/excel', ARRAY['Excel', 'Data Analysis', 'Pivot Tables', 'Charts'], 'paid'),
('Big Data Essentials', 'Coursera', 'https://coursera.org/bigdata', ARRAY['Hadoop', 'Spark', 'Big Data', 'Data Engineering'], 'paid'),

-- Design
('UI/UX Design Specialization', 'Coursera', 'https://coursera.org/ui-ux', ARRAY['UI Design', 'UX Design', 'Figma', 'User Research'], 'paid'),
('Figma Masterclass', 'Udemy', 'https://udemy.com/figma', ARRAY['Figma', 'Prototyping', 'UI Design'], 'paid'),
('Graphic Design Basics', 'Skillshare', 'https://skillshare.com/graphic-design', ARRAY['Graphic Design', 'Adobe Photoshop', 'Illustrator'], 'paid'),
('Web Design for Beginners', 'YouTube', 'https://youtube.com/web-design', ARRAY['Web Design', 'HTML', 'CSS', 'Figma'], 'free'),
('Adobe XD Tutorial', 'Adobe', 'https://adobe.com/xd/learn', ARRAY['Adobe XD', 'Prototyping', 'UI Design'], 'free'),
('Design Thinking Fundamentals', 'Interaction Design Foundation', 'https://interaction-design.org', ARRAY['Design Thinking', 'User Research', 'Ideation'], 'paid'),
('Color Theory for Designers', 'Coursera', 'https://coursera.org/color-theory', ARRAY['Color Theory', 'Visual Design', 'Branding'], 'free'),

-- Digital Marketing
('Digital Marketing Specialization', 'Coursera', 'https://coursera.org/digital-marketing', ARRAY['SEO', 'Social Media', 'Content Marketing', 'Analytics'], 'paid'),
('Google Analytics for Beginners', 'Google', 'https://analytics.google.com/courses', ARRAY['Google Analytics', 'Web Analytics', 'Data Analysis'], 'free'),
('SEO Training Course', 'Moz', 'https://moz.com/learn/seo', ARRAY['SEO', 'Keyword Research', 'Link Building'], 'free'),
('Social Media Marketing', 'HubSpot Academy', 'https://academy.hubspot.com', ARRAY['Social Media Strategy', 'Content Creation', 'Social Media Analytics'], 'free'),
('Content Marketing Certification', 'HubSpot Academy', 'https://academy.hubspot.com/content', ARRAY['Content Marketing', 'Copywriting', 'Content Strategy'], 'free'),
('Email Marketing Mastery', 'Udemy', 'https://udemy.com/email-marketing', ARRAY['Email Marketing', 'Marketing Automation', 'Copywriting'], 'paid'),
('Facebook Ads & Marketing', 'Udemy', 'https://udemy.com/facebook-ads', ARRAY['Facebook Ads', 'Social Media Advertising', 'PPC'], 'paid'),
('Google Ads Certification', 'Google', 'https://skillshop.withgoogle.com', ARRAY['Google Ads', 'PPC', 'Search Marketing'], 'free'),

-- General Skills
('Git & GitHub Crash Course', 'YouTube', 'https://youtube.com/git-github', ARRAY['Git', 'GitHub', 'Version Control'], 'free'),
('Agile Project Management', 'Coursera', 'https://coursera.org/agile', ARRAY['Agile', 'Scrum', 'Project Management'], 'paid'),
('Docker and Kubernetes', 'Udemy', 'https://udemy.com/docker-kubernetes', ARRAY['Docker', 'Kubernetes', 'DevOps', 'Containers'], 'paid'),
('AWS Fundamentals', 'AWS Training', 'https://aws.training', ARRAY['AWS', 'Cloud Computing', 'Infrastructure'], 'free'),
('REST API Design', 'Udemy', 'https://udemy.com/rest-api', ARRAY['REST APIs', 'API Design', 'Backend Development'], 'paid');


COMMIT;
