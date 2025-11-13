// Utility functions for job data transformation

/**
 * Generates responsibilities based on job title, skills, and experience level
 */
export function generateResponsibilities(
  jobTitle: string,
  skills: string[],
  experienceLevel: string
): string[] {
  const titleLower = jobTitle.toLowerCase()
  const responsibilities: string[] = []

  // Common responsibilities based on job title
  if (titleLower.includes('frontend') || titleLower.includes('react') || titleLower.includes('ui')) {
    responsibilities.push('Develop and maintain responsive web applications using modern JavaScript frameworks')
    responsibilities.push('Collaborate with designers to implement pixel-perfect UI components')
    responsibilities.push('Optimize applications for maximum speed and scalability')
    if (skills.includes('React')) {
      responsibilities.push('Build reusable React components and implement state management solutions')
    }
    if (skills.includes('TypeScript')) {
      responsibilities.push('Write type-safe code using TypeScript best practices')
    }
  } else if (titleLower.includes('backend') || titleLower.includes('server') || titleLower.includes('api')) {
    responsibilities.push('Design and develop RESTful APIs and microservices')
    responsibilities.push('Work with databases to design efficient schemas and optimize queries')
    responsibilities.push('Implement authentication and authorization systems')
    if (skills.includes('Node.js')) {
      responsibilities.push('Develop scalable backend services using Node.js and Express')
    }
  } else if (titleLower.includes('full stack') || titleLower.includes('fullstack')) {
    responsibilities.push('Develop full-stack features from database to UI')
    responsibilities.push('Design and implement RESTful APIs')
    responsibilities.push('Build responsive frontend components')
    responsibilities.push('Optimize database queries and application performance')
  } else if (titleLower.includes('developer') || titleLower.includes('engineer')) {
    responsibilities.push('Write clean, maintainable, and well-documented code')
    responsibilities.push('Participate in code reviews and team meetings')
    responsibilities.push('Collaborate with cross-functional teams to deliver high-quality software')
  }

  // Add experience-specific responsibilities
  if (experienceLevel === 'junior' || experienceLevel === 'fresher') {
    responsibilities.push('Learn and apply best practices under guidance of senior developers')
    responsibilities.push('Participate in team meetings and contribute to technical discussions')
  } else if (experienceLevel === 'mid') {
    responsibilities.push('Mentor junior developers and share knowledge')
    responsibilities.push('Lead technical initiatives and contribute to architectural decisions')
  }

  // Add skill-specific responsibilities
  if (skills.includes('Git')) {
    responsibilities.push('Use version control systems (Git) for collaborative development')
  }
  if (skills.includes('Testing') || skills.includes('Jest') || skills.includes('JUnit')) {
    responsibilities.push('Write comprehensive unit and integration tests')
  }

  return responsibilities.length > 0 ? responsibilities : [
    'Collaborate with team members to deliver high-quality software solutions',
    'Participate in code reviews and maintain coding standards',
    'Contribute to technical documentation and knowledge sharing'
  ]
}

/**
 * Generates requirements based on job title, skills, and experience level
 */
export function generateRequirements(
  jobTitle: string,
  skills: string[],
  experienceLevel: string
): string[] {
  const titleLower = jobTitle.toLowerCase()
  const requirements: string[] = []

  // Education requirements
  if (experienceLevel === 'fresher') {
    requirements.push("Bachelor's degree in Computer Science or related field (or equivalent experience)")
  } else {
    requirements.push("Bachelor's degree in Computer Science or related field")
  }

  // Experience requirements
  if (experienceLevel === 'junior') {
    requirements.push('1-3 years of professional development experience')
  } else if (experienceLevel === 'mid') {
    requirements.push('3-5 years of professional development experience')
  } else {
    requirements.push('Strong foundation in software development principles')
  }

  // Skill-based requirements
  if (titleLower.includes('frontend') || titleLower.includes('react')) {
    if (skills.includes('React')) {
      requirements.push('Proficiency with React and modern JavaScript (ES6+)')
    }
    if (skills.includes('TypeScript')) {
      requirements.push('Experience with TypeScript in production applications')
    }
    requirements.push('Strong understanding of CSS and modern styling approaches')
  } else if (titleLower.includes('backend') || titleLower.includes('server')) {
    if (skills.includes('Node.js')) {
      requirements.push('Strong proficiency in Node.js and JavaScript')
    }
    requirements.push('Knowledge of SQL and database design')
    requirements.push('Understanding of REST API principles')
  } else if (titleLower.includes('full stack')) {
    requirements.push('Experience with both frontend and backend technologies')
    requirements.push('Understanding of full-stack development patterns')
  }

  // Common requirements
  requirements.push('Strong problem-solving and analytical skills')
  requirements.push('Excellent communication and teamwork abilities')
  
  if (skills.includes('Git')) {
    requirements.push('Experience with version control systems (Git)')
  }

  return requirements.length > 0 ? requirements : [
    "Bachelor's degree in Computer Science or related field",
    'Strong problem-solving and communication skills',
    'Ability to work in a collaborative team environment'
  ]
}

/**
 * Generates benefits based on job type and location
 */
export function generateBenefits(
  jobType: string,
  location: string
): string[] {
  const benefits: string[] = []
  const locationLower = location.toLowerCase()

  // Common benefits
  benefits.push('Competitive salary and benefits package')
  
  if (locationLower.includes('remote')) {
    benefits.push('Remote work flexibility')
    benefits.push('Work from anywhere')
  } else {
    benefits.push('Flexible working hours')
  }

  if (jobType === 'full_time' || jobType === 'full-time') {
    benefits.push('Comprehensive health insurance')
    benefits.push('401(k) or retirement plans')
    benefits.push('Paid time off and holidays')
  }

  benefits.push('Professional development opportunities')
  benefits.push('Collaborative and supportive work environment')

  return benefits
}

