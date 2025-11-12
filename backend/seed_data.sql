-- Seed data for CareerBridge application
-- This file contains sample data for testing and development

-- Insert sample jobs
INSERT INTO jobs (job_title, company, location, required_skills, experience_level, job_type) VALUES
('Frontend Developer', 'Tech Solutions Inc', 'Remote', ARRAY['JavaScript', 'React', 'CSS', 'HTML'], 'junior', 'full_time'),
('Full Stack Developer', 'Innovation Labs', 'New York, NY', ARRAY['JavaScript', 'Node.js', 'React', 'PostgreSQL', 'Docker'], 'mid', 'full_time'),
('Junior Web Developer', 'Startup Hub', 'San Francisco, CA', ARRAY['HTML', 'CSS', 'JavaScript'], 'fresher', 'internship'),
('React Developer', 'Digital Agency', 'Austin, TX', ARRAY['React', 'JavaScript', 'TypeScript', 'Redux'], 'junior', 'full_time'),
('Backend Developer', 'Cloud Systems', 'Seattle, WA', ARRAY['Node.js', 'Python', 'PostgreSQL', 'AWS'], 'mid', 'full_time'),
('Data Analyst', 'Analytics Corp', 'Boston, MA', ARRAY['Python', 'SQL', 'Pandas', 'Excel', 'Tableau'], 'junior', 'full_time'),
('Junior Data Scientist', 'AI Innovations', 'Remote', ARRAY['Python', 'Machine Learning', 'Statistics', 'SQL'], 'fresher', 'internship'),
('Data Engineer', 'BigData Solutions', 'Chicago, IL', ARRAY['Python', 'SQL', 'Apache Spark', 'AWS', 'ETL'], 'mid', 'full_time'),
('UI/UX Designer', 'Creative Studio', 'Los Angeles, CA', ARRAY['Figma', 'Adobe XD', 'Sketch', 'User Research'], 'junior', 'full_time'),
('Graphic Designer', 'Marketing Agency', 'Miami, FL', ARRAY['Adobe Photoshop', 'Illustrator', 'InDesign', 'Branding'], 'fresher', 'part_time'),
('Product Designer', 'Tech Products Co', 'San Diego, CA', ARRAY['Figma', 'Prototyping', 'User Testing', 'Design Systems'], 'mid', 'full_time'),
('Digital Marketing Specialist', 'Growth Marketing', 'Denver, CO', ARRAY['SEO', 'Google Analytics', 'Content Marketing', 'Social Media'], 'junior', 'full_time'),
('Social Media Manager', 'Brand Agency', 'Portland, OR', ARRAY['Social Media Strategy', 'Content Creation', 'Analytics', 'Copywriting'], 'fresher', 'part_time'),
('Marketing Analyst', 'E-commerce Giant', 'Remote', ARRAY['Google Analytics', 'Excel', 'SQL', 'A/B Testing', 'Data Visualization'], 'junior', 'full_time'),
('Content Marketing Manager', 'SaaS Company', 'Nashville, TN', ARRAY['Content Strategy', 'SEO', 'Copywriting', 'Email Marketing'], 'mid', 'full_time'),
('Web Designer', 'Design Collective', 'Philadelphia, PA', ARRAY['HTML', 'CSS', 'Figma', 'Responsive Design', 'WordPress'], 'junior', 'freelance'),
('Python Developer', 'FinTech Startup', 'Remote', ARRAY['Python', 'Django', 'REST APIs', 'PostgreSQL'], 'junior', 'full_time'),
('DevOps Engineer', 'Cloud Infrastructure', 'Dallas, TX', ARRAY['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'], 'mid', 'full_time'),
('QA Engineer', 'Software Testing Co', 'Atlanta, GA', ARRAY['Manual Testing', 'Selenium', 'JavaScript', 'Test Automation'], 'fresher', 'internship'),
('Business Analyst', 'Consulting Firm', 'Washington DC', ARRAY['Requirements Gathering', 'SQL', 'Excel', 'Agile', 'Documentation'], 'junior', 'full_time');

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
