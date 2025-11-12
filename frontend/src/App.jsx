import { useState } from 'react'
import './App.css'
import {
  FiHome,
  FiBriefcase,
  FiBookOpen,
  FiUser,
  FiLogOut,
  FiZap,
  FiLogIn,
} from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi2'
import { AnimatePresence, motion } from 'framer-motion'

const navItems = [
  { label: 'Dashboard', icon: FiHome, key: 'dashboard' },
  { label: 'Jobs', icon: FiBriefcase, key: 'jobs' },
  { label: 'Resources', icon: FiBookOpen, key: 'resources' },
  { label: 'Profile', icon: FiUser, key: 'profile' },
  { label: 'Auth', icon: FiLogIn, key: 'auth' },
  { label: 'Logout', icon: FiLogOut, key: 'logout' },
]

const userProfile = {
  name: 'Amina Rahman',
  education: 'BSc in Computer Science, 2025',
  experience: 'Entry Level',
  preferredTrack: 'Full-Stack Engineering',
  focusSkills: ['React', 'TypeScript', 'UI Design'],
  momentum: 86,
}

const recommendedJobs = [
  {
    title: 'Junior Frontend Developer',
    company: 'Neon Labs',
    match: 92,
    tags: ['React', 'UI', 'Design Systems'],
  },
  {
    title: 'AI Product Apprentice',
    company: 'Aurora AI',
    match: 88,
    tags: ['Prompt Design', 'Product Sense', 'Python'],
  },
  {
    title: 'Innovation Fellow',
    company: 'FutureWork Collective',
    match: 84,
    tags: ['Research', 'Youth Programs', 'Community'],
  },
]

const learningResources = [
  {
    title: 'Designing with Data',
    provider: 'Notion Academy',
    skill: 'Product Analytics',
    cost: 'Free',
  },
  {
    title: 'React Patterns Workshop',
    provider: 'Frontend Mastery',
    skill: 'React',
    cost: '$49',
  },
  {
    title: 'AI Roadmapping Lab',
    provider: 'CareerBridge',
    skill: 'Career Strategy',
    cost: 'Included',
  },
  {
    title: 'Portfolio Storytelling',
    provider: 'Linear Stories',
    skill: 'Personal Branding',
    cost: '$19',
  },
]

const jobListings = [
  {
    id: 'job-01',
    title: 'AI Product Fellow',
    company: 'Aurora Launchpad',
    location: 'Remote · Global',
    experience: 'Entry Level',
    type: 'Fellowship',
    track: 'Product Management',
    tags: ['AI', 'Product Strategy', 'User Research'],
    description:
      'Join Aurora Launchpad to build AI-driven experiences for youth employment. Collaborate with product mentors to deploy pilot solutions across universities.',
    responsibilities: [
      'Translate student feedback into actionable product requirements.',
      'Prototype AI-driven product features with cross-functional teams.',
      'Present weekly roadmap updates to program mentors.',
    ],
    requirements: [
      'Student or 2024/2025 graduate with product curiosity.',
      'Comfortable working with low-code tools and AI prompts.',
      'Strong collaboration and storytelling skills.',
    ],
    perks: ['Mentorship from AI product leads', 'Global cohort network', 'Monthly stipend'],
  },
  {
    id: 'job-02',
    title: 'Junior Frontend Developer',
    company: 'Neon Labs',
    location: 'Dhaka · Hybrid',
    experience: 'Entry Level',
    type: 'Full-time',
    track: 'Engineering',
    tags: ['React', 'TypeScript', 'UI Systems'],
    description:
      'Neon Labs is scaling a youth mentorship platform and is looking for a frontend developer passionate about polished UI and accessibility.',
    responsibilities: [
      'Build and ship reusable, accessible React components.',
      'Collaborate with product designers to deliver neon-inspired interfaces.',
      'Integrate REST and GraphQL endpoints with design system primitives.',
    ],
    requirements: [
      '1+ internship or project building React apps.',
      'Familiarity with TypeScript and Tailwind or CSS-in-JS.',
      'Understanding of accessibility and responsive design best practices.',
    ],
    perks: ['Team on-site every quarter', 'Learning stipend', 'MacBook and design hardware'],
  },
  {
    id: 'job-03',
    title: 'Career Navigator Intern',
    company: 'FutureWork Collective',
    location: 'Singapore · Remote',
    experience: 'Internship',
    type: 'Internship',
    track: 'Career Coaching',
    tags: ['Youth Mentorship', 'Data Analysis', 'Public Speaking'],
    description:
      'Support FutureWork Collective as they deliver career accelerators for underserved youth communities across Southeast Asia.',
    responsibilities: [
      'Facilitate virtual career discovery workshops.',
      'Analyze learner feedback to refine learning pathways.',
      'Coordinate with partner NGOs to schedule live sessions.',
    ],
    requirements: [
      'Current student with leadership experience.',
      'Comfortable presenting to both small and large audiences.',
      'Basic data analysis skills (Excel, Notion, or Airtable).',
    ],
    perks: ['Impact-driven mission', 'Weekly coaching circles', 'Certification upon completion'],
  },
  {
    id: 'job-04',
    title: 'Learning Experience Designer',
    company: 'SkillSprint',
    location: 'Remote · Asia',
    experience: 'Mid Level',
    type: 'Contract',
    track: 'Design',
    tags: ['Instructional Design', 'Figma', 'Content Strategy'],
    description:
      'Craft story-driven, gamified learning experiences for SkillSprint cohorts focused on digital careers.',
    responsibilities: [
      'Design narrative-driven lesson flows and interactive assets.',
      'Collaborate with SMEs to chunk complex concepts into digestible modules.',
      'Prototype layouts in Figma and iterate using learner feedback.',
    ],
    requirements: [
      '2+ years designing learning experiences or curriculum.',
      'Comfortable using Figma and Notion.',
      'Portfolio showcasing learner-centered design.',
    ],
    perks: ['Remote-first team', 'Access to premium design tools', 'Competitive contract rates'],
  },
]

const resourceCatalog = [
  {
    id: 'res-01',
    title: 'UI Design Foundations for Hackathons',
    platform: 'YouTube · Flux Academy',
    cost: 'Free',
    skill: 'Design',
    url: '#',
    description: 'Learn to craft glowing glassmorphism interfaces that impress judges and recruiters alike.',
  },
  {
    id: 'res-02',
    title: 'Career Storytelling in Notion',
    platform: 'Notion Learn',
    cost: 'Free',
    skill: 'Personal Branding',
    url: '#',
    description: 'Turn your projects and reflections into a narrative portfolio curated for youth programs.',
  },
  {
    id: 'res-03',
    title: 'Modern React for Emerging Engineers',
    platform: 'Frontend Mastery',
    cost: 'Paid',
    skill: 'React',
    url: '#',
    description: 'Level-up with component patterns, hooks, and state machines tailored for junior developers.',
  },
  {
    id: 'res-04',
    title: 'Excel for Social Impact Analytics',
    platform: 'Coursera',
    cost: 'Paid',
    skill: 'Excel',
    url: '#',
    description: 'Analyze workforce programs and youth employment metrics with practical spreadsheet skills.',
  },
  {
    id: 'res-05',
    title: 'Designing Youth Career Workshops',
    platform: 'Skillshare',
    cost: 'Paid',
    skill: 'Facilitation',
    url: '#',
    description: 'Facilitate engaging sessions that guide students through career discovery journeys.',
  },
  {
    id: 'res-06',
    title: 'Prompt Engineering Playbook',
    platform: 'CareerBridge Labs',
    cost: 'Free',
    skill: 'AI',
    url: '#',
    description: 'Work with AI assistants to personalize career paths and tailor mentorship experiences.',
  },
]

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [skills, setSkills] = useState(['React', 'Communication', 'Figma'])
  const [newSkill, setNewSkill] = useState('')
  const [jobSearch, setJobSearch] = useState('')
  const [filterTrack, setFilterTrack] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterLocation, setFilterLocation] = useState('all')
  const [selectedJob, setSelectedJob] = useState(null)
  const [resourceSkill, setResourceSkill] = useState('all')
  const [resourceCost, setResourceCost] = useState('all')
  const [authMode, setAuthMode] = useState('login')

  const handleAddSkill = () => {
    const trimmed = newSkill.trim()
    if (!trimmed || skills.includes(trimmed)) return
    setSkills([...skills, trimmed])
    setNewSkill('')
  }

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((item) => item !== skill))
  }

  const handleSkillKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddSkill()
    }
  }

  const uniqueTracks = ['all', ...new Set(jobListings.map((job) => job.track))]
  const uniqueTypes = ['all', ...new Set(jobListings.map((job) => job.type))]
  const uniqueLocations = ['all', ...new Set(jobListings.map((job) => job.location))]

  const uniqueResourceSkills = ['all', ...new Set(resourceCatalog.map((resource) => resource.skill))]
  const uniqueResourceCosts = ['all', ...new Set(resourceCatalog.map((resource) => resource.cost))]

  const filteredJobs = jobListings.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.company.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.tags.some((tag) => tag.toLowerCase().includes(jobSearch.toLowerCase()))

    const matchesTrack = filterTrack === 'all' || job.track === filterTrack
    const matchesType = filterType === 'all' || job.type === filterType
    const matchesLocation = filterLocation === 'all' || job.location === filterLocation

    return matchesSearch && matchesTrack && matchesType && matchesLocation
  })

  const filteredResources = resourceCatalog.filter((resource) => {
    const matchesSkill = resourceSkill === 'all' || resource.skill === resourceSkill
    const matchesCost = resourceCost === 'all' || resource.cost === resourceCost
    return matchesSkill && matchesCost
  })

  const getHeaderTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Design your next step with confidence'
      case 'profile':
        return 'Shape your story with clarity'
      case 'jobs':
        return 'Discover roles curated for your momentum'
      case 'resources':
        return 'Learning pathways tuned for tomorrow'
      case 'auth':
        return authMode === 'login'
          ? 'Re-enter the bridge to your next opportunity'
          : 'Join CareerBridge and unlock guided growth'
      default:
        return 'Stay inspired with CareerBridge'
    }
  }

  const getHeaderCta = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Generate AI Roadmap'
      case 'profile':
        return 'Preview AI Profile'
      case 'jobs':
        return 'Create job alert'
      case 'resources':
        return 'Suggest new resource'
      case 'auth':
        return authMode === 'login' ? 'Need help logging in?' : 'Already have an account?'
      default:
        return 'Back to dashboard'
    }
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <section className="dashboard-grid">
            <article className="panel profile-panel" style={{ '--delay': '0s' }}>
              <header className="panel__header">
                <h2>Your Profile Snapshot</h2>
                <span className="panel__meta">Updated 2 hours ago</span>
              </header>

              <div className="profile-card">
                <div className="profile-card__hero">
                  <div className="profile-card__avatar">
                    <span>{userProfile.name.charAt(0)}</span>
                  </div>
                  <div className="profile-card__main">
                    <h3>{userProfile.name}</h3>
                    <p>{userProfile.education}</p>
                    <div className="profile-card__tags">
                      <span>{userProfile.experience}</span>
                      <span>{userProfile.preferredTrack}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-card__skills">
                  <p className="section-label">Focus Skills</p>
                  <div className="chips">
                    {userProfile.focusSkills.map((skill) => (
                      <span key={skill} className="chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="profile-card__momentum">
                  <div className="momentum__copy">
                    <p className="section-label">Momentum Score</p>
                    <h4>{userProfile.momentum}</h4>
                    <p className="momentum__note">
                      Trending up — keep exploring tailored roles and resources.
                    </p>
                  </div>
                  <div className="momentum__track">
                    <div className="momentum__bar" style={{ '--progress': `${userProfile.momentum}%` }} />
                  </div>
                </div>
              </div>
            </article>

            <article className="panel jobs-panel" style={{ '--delay': '0.08s' }}>
              <header className="panel__header">
                <h2>Recommended Roles</h2>
                <button className="ghost-cta" type="button">
                  View all
                </button>
              </header>

              <ul className="jobs-list">
                {recommendedJobs.map((job, index) => (
                  <li key={job.title} className="jobs-list__item" style={{ '--item-delay': `${index * 0.05}s` }}>
                    <div className="jobs-list__body">
                      <div>
                        <h3>{job.title}</h3>
                        <p>{job.company}</p>
                      </div>
                      <span className="match-chip">{job.match}% match</span>
                    </div>
                    <div className="chips chips--compact">
                      {job.tags.map((tag) => (
                        <span key={tag} className="chip chip--soft">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel resources-panel" style={{ '--delay': '0.16s' }}>
              <header className="panel__header panel__header--split">
                <div>
                  <h2>Learning Resources</h2>
                  <p className="panel__meta">Curated pathways to accelerate your skills</p>
                </div>
                <select className="filter-select" defaultValue="relevance">
                  <option value="relevance">Sort by relevance</option>
                  <option value="cost">Sort by cost</option>
                  <option value="duration">Sort by duration</option>
                </select>
              </header>

              <div className="resource-grid">
                {learningResources.map((resource, index) => (
                  <div
                    key={resource.title}
                    className="resource-card"
                    style={{ '--item-delay': `${index * 0.06}s` }}
                  >
                    <div className="resource-card__badge">{resource.cost}</div>
                    <h3>{resource.title}</h3>
                    <p>{resource.provider}</p>
                    <div className="chip chip--outline">{resource.skill}</div>
                    <button className="inline-link" type="button">
                      Explore
                    </button>
                  </div>
                ))}
              </div>
            </article>
          </section>
        )
      case 'profile':
        return (
          <section className="profile-page">
            <div className="page-intro">
              <p className="eyebrow">Personalized Identity</p>
              <h1>Craft your professional narrative</h1>
              <p>
                Update your details, showcase your strengths, and keep your momentum aligned with the roles you want.
              </p>
            </div>

            <div className="profile-layout">
              <form className="profile-form" onSubmit={(event) => event.preventDefault()}>
                <div className="field-group">
                  <label htmlFor="name">Full name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue="Amina Rahman"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue="amina.rahman@email.com"
                    placeholder="name@email.com"
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="education">Education level</label>
                  <select id="education" name="education" defaultValue="bachelors">
                    <option value="associate">Associate</option>
                    <option value="bachelors">Bachelor&apos;s degree</option>
                    <option value="masters">Master&apos;s degree</option>
                    <option value="phd">Doctorate</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="field-group">
                  <label htmlFor="experience">Experience level</label>
                  <select id="experience" name="experience" defaultValue="entry">
                    <option value="student">Student</option>
                    <option value="entry">Entry level</option>
                    <option value="mid">Mid level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Leadership</option>
                  </select>
                </div>
                <div className="field-group field-group--full">
                  <label htmlFor="track">Preferred career track</label>
                  <input
                    id="track"
                    name="track"
                    type="text"
                    defaultValue="Full-Stack Engineering"
                    placeholder="e.g. Product Design, AI Research"
                  />
                </div>
              </form>

              <div className="skills-panel">
                <div className="skills-panel__card">
                  <h3>Skills toolkit</h3>
                  <p>Curate the strengths you want CareerBridge to highlight.</p>

                  <div className="skill-input">
                    <input
                      type="text"
                      placeholder="Add a new skill"
                      value={newSkill}
                      onChange={(event) => setNewSkill(event.target.value)}
                      onKeyDown={handleSkillKeyDown}
                    />
                    <button type="button" onClick={handleAddSkill}>
                      Add
                    </button>
                  </div>

                  <div className="skill-tags">
                    {skills.map((skill) => (
                      <span key={skill} className="skill-tag">
                        {skill}
                        <button
                          type="button"
                          aria-label={`Remove ${skill}`}
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="notes-card">
                  <label htmlFor="notes">CV / personal notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={7}
                    placeholder="Paste your CV highlights, project links, or personal story. CareerBridge will use this to tailor future recommendations."
                    defaultValue={`- Software intern @ Aurora Labs (2024)\n- Led youth hackathon career mentoring circle\n- Currently exploring AI product roles and web3 ecosystems`}
                  />
                </div>

                <button className="primary-cta save-button" type="button">
                  Save changes
                </button>
              </div>
            </div>
          </section>
        )
      case 'jobs':
        return (
          <section className="jobs-page">
            <div className="jobs-shell">
              <aside className="jobs-filters">
                <div className="filter-group">
                  <label htmlFor="job-search">Search roles</label>
                  <div className="search-input">
                    <input
                      id="job-search"
                      type="search"
                      placeholder="Search by role, company, or skill"
                      value={jobSearch}
                      onChange={(event) => setJobSearch(event.target.value)}
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label htmlFor="track-filter">Career track</label>
                  <div className="select-shell">
                    <select
                      id="track-filter"
                      value={filterTrack}
                      onChange={(event) => setFilterTrack(event.target.value)}
                    >
                      {uniqueTracks.map((track) => (
                        <option key={track} value={track}>
                          {track === 'all' ? 'All tracks' : track}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="filter-group">
                  <label htmlFor="type-filter">Job type</label>
                  <div className="select-shell">
                    <select
                      id="type-filter"
                      value={filterType}
                      onChange={(event) => setFilterType(event.target.value)}
                    >
                      {uniqueTypes.map((type) => (
                        <option key={type} value={type}>
                          {type === 'all' ? 'All types' : type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="filter-group">
                  <label htmlFor="location-filter">Location</label>
                  <div className="select-shell">
                    <select
                      id="location-filter"
                      value={filterLocation}
                      onChange={(event) => setFilterLocation(event.target.value)}
                    >
                      {uniqueLocations.map((location) => (
                        <option key={location} value={location}>
                          {location === 'all' ? 'All locations' : location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  className="ghost-cta reset-filters"
                  type="button"
                  onClick={() => {
                    setFilterTrack('all')
                    setFilterType('all')
                    setFilterLocation('all')
                    setJobSearch('')
                  }}
                >
                  Reset filters
                </button>
              </aside>

              <div className="jobs-results">
                <div className="jobs-results__header">
                  <div>
                    <h2>Opportunities tailored for emerging talent</h2>
                    <p>
                      {filteredJobs.length} role{filteredJobs.length === 1 ? '' : 's'} match your filters
                    </p>
                  </div>
                  <select className="sort-select" defaultValue="recent">
                    <option value="recent">Sort by newest</option>
                    <option value="match">Sort by skill match</option>
                    <option value="deadline">Sort by application deadline</option>
                  </select>
                </div>

                <div className="jobs-grid">
                  {filteredJobs.map((job) => (
                    <article key={job.id} className="job-card">
                      <div className="job-card__header">
                        <h3>{job.title}</h3>
                        <span className="badge">{job.type}</span>
                      </div>
                      <p className="job-card__company">{job.company}</p>
                      <div className="job-card__meta">
                        <span>{job.location}</span>
                        <span>{job.experience}</span>
                        <span>{job.track}</span>
                      </div>
                      <div className="chips chips--compact job-card__tags">
                        {job.tags.map((tag) => (
                          <span key={tag} className="chip chip--outline">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="job-card__actions">
                        <button className="inline-link" type="button" onClick={() => setSelectedJob(job)}>
                          View details
                        </button>
                        <button className="ghost-cta" type="button">
                          Save
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {selectedJob && (
              <div className="job-modal" role="dialog" aria-modal="true">
                <div className="job-modal__content">
                  <header className="job-modal__header">
                    <div>
                      <p className="badge badge--soft">{selectedJob.type}</p>
                      <h3>{selectedJob.title}</h3>
                      <p className="job-modal__company">
                        {selectedJob.company} · {selectedJob.location}
                      </p>
                    </div>
                    <button className="modal-close" type="button" onClick={() => setSelectedJob(null)}>
                      Close
                    </button>
                  </header>

                  <div className="job-modal__body">
                    <section>
                      <h4>About the opportunity</h4>
                      <p>{selectedJob.description}</p>
                    </section>

                    <section>
                      <h4>Key responsibilities</h4>
                      <ul>
                        {selectedJob.responsibilities.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <h4>What you&apos;ll bring</h4>
                      <ul>
                        {selectedJob.requirements.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <h4>Perks &amp; growth</h4>
                      <ul className="perks-list">
                        {selectedJob.perks.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  <footer className="job-modal__footer">
                    <button className="primary-cta" type="button">
                      Save job
                    </button>
                    <button className="ghost-cta" type="button">
                      Share
                    </button>
                  </footer>
                </div>
                <div className="job-modal__backdrop" onClick={() => setSelectedJob(null)} />
              </div>
            )}
          </section>
        )
      case 'resources':
        return (
          <section className="resources-page">
            <div className="page-intro">
              <p className="eyebrow">Growth in motion</p>
              <h1>Courses and playbooks that amplify your next role</h1>
              <p>
                Filter by skill focus and investment level to curate a learning stack that keeps you future-ready.
              </p>
            </div>

            <div className="resources-shell">
              <aside className="resources-filters">
                <div className="filter-group">
                  <label htmlFor="resource-skill">Skill focus</label>
                  <div className="select-shell">
                    <select
                      id="resource-skill"
                      value={resourceSkill}
                      onChange={(event) => setResourceSkill(event.target.value)}
                    >
                      {uniqueResourceSkills.map((skill) => (
                        <option key={skill} value={skill}>
                          {skill === 'all' ? 'All skills' : skill}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="filter-group">
                  <label htmlFor="resource-cost">Cost</label>
                  <div className="select-shell">
                    <select
                      id="resource-cost"
                      value={resourceCost}
                      onChange={(event) => setResourceCost(event.target.value)}
                    >
                      {uniqueResourceCosts.map((cost) => (
                        <option key={cost} value={cost}>
                          {cost === 'all' ? 'All costs' : cost}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  className="ghost-cta reset-filters"
                  type="button"
                  onClick={() => {
                    setResourceSkill('all')
                    setResourceCost('all')
                  }}
                >
                  Reset filters
                </button>
              </aside>

              <div className="resources-grid">
                {filteredResources.map((resource) => (
                  <article key={resource.id} className="resource-tile">
                    <header className="resource-tile__header">
                      <span className={`cost-tag cost-tag--${resource.cost.toLowerCase()}`}>
                        {resource.cost}
                      </span>
                      <h3>{resource.title}</h3>
                      <p>{resource.platform}</p>
                    </header>
                    <p className="resource-tile__description">{resource.description}</p>
                    <div className="resource-tile__meta">
                      <span className="chip chip--soft">{resource.skill}</span>
                    </div>
                    <div className="resource-tile__actions">
                      <button className="inline-link" type="button">
                        Preview
                      </button>
                      <button className="primary-cta resource-visit" type="button">
                        Visit
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )
      case 'auth':
        return (
          <section className="auth-page">
            <div className="auth-shell">
              <div className="auth-visual">
                <div className="visual-layer visual-layer--one" />
                <div className="visual-layer visual-layer--two" />
                <div className="visual-copy">
                  <span className="eyebrow">Future-forward</span>
                  <h2>Navigate every career season with clarity</h2>
                  <p>
                    AI-tailored pathways, mentor-matched opportunities, and a community cheering for your next leap.
                  </p>
                </div>
                <div className="visual-stats">
                  <div>
                    <strong>2.4k</strong>
                    <span>Students guided</span>
                  </div>
                  <div>
                    <strong>87%</strong>
                    <span>Role confidence boost</span>
                  </div>
                </div>
              </div>

              <div className="auth-form">
                <div className="auth-toggle">
                  <button
                    type="button"
                    className={`auth-toggle__btn ${authMode === 'login' ? 'is-active' : ''}`}
                    onClick={() => setAuthMode('login')}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className={`auth-toggle__btn ${authMode === 'register' ? 'is-active' : ''}`}
                    onClick={() => setAuthMode('register')}
                  >
                    Register
                  </button>
                </div>

                {authMode === 'login' ? (
                  <form className="auth-form__body" onSubmit={(event) => event.preventDefault()}>
                    <div className="field-group field-group--full">
                      <label htmlFor="login-email">Email</label>
                      <input
                        id="login-email"
                        name="login-email"
                        type="email"
                        placeholder="name@email.com"
                        required
                      />
                      <span className="field-hint">Use a school or professional email for faster verification.</span>
                    </div>
                    <div className="field-group field-group--full">
                      <label htmlFor="login-password">Password</label>
                      <input
                        id="login-password"
                        name="login-password"
                        type="password"
                        placeholder="Enter your password"
                        minLength={8}
                        required
                      />
                      <span className="field-hint">At least 8 characters, including one number.</span>
                    </div>
                    <div className="auth-extra">
                      <label className="remember-me">
                        <input type="checkbox" defaultChecked />
                        <span>Keep me signed in</span>
                      </label>
                      <button type="button" className="inline-link auth-link">
                        Forgot password?
                      </button>
                    </div>
                    <button className="primary-cta auth-submit" type="submit">
                      Login
                    </button>
                    <p className="auth-switch">
                      New to CareerBridge?{' '}
                      <button type="button" className="inline-link" onClick={() => setAuthMode('register')}>
                        Create an account
                      </button>
                    </p>
                  </form>
                ) : (
                  <form className="auth-form__body auth-form__body--register" onSubmit={(event) => event.preventDefault()}>
                    <div className="field-group">
                      <label htmlFor="register-name">Full name</label>
                      <input
                        id="register-name"
                        name="register-name"
                        type="text"
                        placeholder="Enter your full name"
                        required
                      />
                      <span className="field-hint">This helps mentors personalize outreach.</span>
                    </div>
                    <div className="field-group">
                      <label htmlFor="register-email">Email</label>
                      <input
                        id="register-email"
                        name="register-email"
                        type="email"
                        placeholder="name@email.com"
                        required
                      />
                      <span className="field-hint">Verification code will be sent here.</span>
                    </div>
                    <div className="field-group">
                      <label htmlFor="register-education">Education</label>
                      <input
                        id="register-education"
                        name="register-education"
                        type="text"
                        placeholder="e.g. BSc in Computer Science (2025)"
                      />
                    </div>
                    <div className="field-group">
                      <label htmlFor="register-experience">Experience level</label>
                      <select id="register-experience" name="register-experience" defaultValue="student">
                        <option value="student">Student</option>
                        <option value="entry">Entry level (0-2 years)</option>
                        <option value="mid">Mid level (2-5 years)</option>
                        <option value="senior">Senior (5+ years)</option>
                      </select>
                    </div>
                    <div className="field-group field-group--full">
                      <label htmlFor="register-track">Preferred career track</label>
                      <input
                        id="register-track"
                        name="register-track"
                        type="text"
                        placeholder="e.g. Product Design, Data Science"
                      />
                    </div>
                    <div className="field-group field-group--full">
                      <label htmlFor="register-password">Password</label>
                      <input
                        id="register-password"
                        name="register-password"
                        type="password"
                        placeholder="Create a password"
                        minLength={8}
                        required
                      />
                      <span className="field-hint">Use 8+ characters with a mix of letters and numbers.</span>
                    </div>
                    <button className="primary-cta auth-submit" type="submit">
                      Create account
                    </button>
                    <p className="auth-switch">
                      Already part of CareerBridge?{' '}
                      <button type="button" className="inline-link" onClick={() => setAuthMode('login')}>
                        Login instead
                      </button>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </section>
        )
      default:
        return (
          <section className="placeholder-page">
            <div className="placeholder-card">
              <p className="eyebrow">See you soon</p>
              <h2>Logging out from the prototype</h2>
              <p>Your session will stay active during the hackathon showcase.</p>
            </div>
          </section>
        )
    }
  }

  const pageVariants = {
    initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: 'easeOut' } },
    exit: { opacity: 0, y: -16, filter: 'blur(8px)', transition: { duration: 0.3, ease: 'easeIn' } },
  }

  const content = renderContent()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="brand__icon">
            <HiSparkles />
          </span>
          <div>
            <p className="brand__label">CareerBridge</p>
            <p className="brand__tagline">AI Career Roadmaps</p>
          </div>
        </div>
        <nav className="sidebar__nav">
          {navItems.map(({ label, icon: Icon, key }) => (
            <button
              key={key}
              className={`nav__item ${activePage === key ? 'nav__item--active' : ''}`}
              type="button"
              onClick={() => setActivePage(key)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar__badge">
          <FiZap />
          <span>AI insights live</span>
        </div>
      </aside>

      <main className="main-area">
        <motion.header
          className="main-header"
          key={`header-${activePage}-${authMode}`}
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
      <div>
            <p className="eyebrow">Welcome back</p>
          <h1>{getHeaderTitle()}</h1>
      </div>
        <button className="primary-cta" type="button">
          {getHeaderCta()}
        </button>
        </motion.header>

        <div className="page-stage">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`page-${activePage}-${authMode}`}
              className="page-transition"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      </div>
  )
}

export default App
