import { gravatar } from "../utils/gravatar";
import yearsOfExperience from "./date";
import { PROFILE } from "./variables";

export const RESUME = {
  name: "Vikram Sangat",
  position: "Senior Software Enginner - React | Flutter | Python | Node.js",
  description: `
  I am a senior software engineer with over ${yearsOfExperience()} years of experience. My technical work spans front-end, hybrid mobile application and backend services development. I also actively manage and lead development teams throught the development lifecycle. In the past, I have worked on mobile applications and data analysis dashboard create, During with I have also secured couple of patents. I am keen to explore interesting roles in broad areas of application development.`,
  profile: PROFILE,
  address: "Bangalore, India",
  gravatar: gravatar(200),
  github: "https://github.com/sangatDVikram",
  email: "v.sangat98@gmail.com",
  linkedIn: "https://www.linkedin.com/in/sangatdvikram/",
  mobile: "+91-9503415652",
  languages: ["Python", "Javascript", "HTML", "CSS", "Dart", "PHP", "C#"],
  frameworks: [
    "D3.js",
    "Django",
    "Express",
    "Flutter",
    "Node.js",
    "NextJS",
    "React",
    "Redux",
    "RxJs",
    "Typescript",
  ],
  databases: ["Elasticsearch", "MongoDB", "PostgreSQL", "MySQL"],
  tools: ["Visual Studio Code", "Android Studio", "Postman", "git"],
  patents: [
    {
      link: "GB2572361A",
      url: "https://patents.google.com/patent/GB2572361A",
      title: "System and method for determining allocation of sales force",
    },
    {
      link: "USD870129S1",
      url: "https://patents.google.com/patent/USD870129S1",
      title: "Display screen with transitional graphical user interface",
    },
  ],
  education: [
    {
      degree: "Bachelor of Engineering, Computer Science",
      university: "Jhulelal Institute Of Technology, Nagpur",
      duration: "2008 - 2012",
    },
    {
      degree: "Master of Technology, CS and IT",
      university: "Vishwakarma Institute of Technology, Pune",
      duration: "2013 - 2015 (Completed coursework)",
    },
  ],
  certifications: [
    {
      title: "Certified Blockchain Developer",
      issuer: "Blockchain Council",
      link: "https://www.credential.net/56729257-fa68-446f-a156-11b6de00f5e4#gs.9q3r7k",
    },
  ],
  awards: [
    {
      title: "Jedi Knight for versatile performance",
      issuer: "Innoplexus Consulting Services Pvt Ltd",
    },
    {
      title: "Mentored in PyCamp 2K17",
      issuer: "PyCamp 2K17 - Nagpur",
    },
  ],
  experience: [
    {
      title: "Senior Software Engineer - Frontend",
      company: "Tekion",
      isCurrent: true,
      duration: [new Date(2022, 11, 12), new Date(2022, 10, 24)],
      area: "Bangalore, India",
      techStack: ["React", "Redux", "Thunk", "Webpack 5"],
      description: "",
      tasks: [
        "Leading a team of frontend engineers, driving development and optimization of scalable applications.",
        "Managing the DRP Onboarding modules throughout the development lifecycle, ensuring seamless integration and efficiency.",
        "Architected a monorepo-based application, enhancing code reusability, maintainability, and developer productivity.",
        "Designed and implemented onboarding and pre-onboarding workflows for dealers and OEMs, streamlining user experience and operational efficiency.",
      ],
    },
    {
      title: "Senior Software Engineer - UI",
      company: "Visa",
      duration: [new Date(2021, 11, 13), new Date(2022, 10, 24)],
      area: "Bangalore, India",
      techStack: ["React", "Redux", "Single-SPA", "RxJs", "Material-UI"],
      description: "",
      tasks: [
        "Led the UI development team for the Merchant Onboarding application, ensuring seamless user experiences and efficient workflows.",
        "Implemented micro frontends within a React application, utilizing manifests for dynamic configuration and modular architecture.",
        "Developed common UI components and integrated them into the Rapid Seller Onboarding Platform, accelerating development and standardization.",
        "Integrated third-party APIs like ThreatMatrix, Giact, and Experian for user verification, ensuring security and compliance within the onboarding flow.",
      ],
    },
    {
      title: "Web Full Stack Developer",
      company: "DMart Labs (Avenue Supermarkets Ltd)",
      duration: [new Date(2019, 9, 1), new Date(2021, 10, 25)],
      area: "Bangalore, India",
      techStack: [
        "React",
        "Redux",
        "Node.js",
        "Single-SPA",
        "RxJs",
        "Flutter",
        "Material-UI",
      ],
      description: "",
      tasks: [
        "Led the frontend team, overseeing development and optimization of in-house applications.",
        "Architected a micro frontend system using Single SPA, seamlessly integrating React-based child applications.",
        "Designed and implemented an Application Development SDK and Component Libraries, cutting development time by 50%.",
        "Developed a framework library providing a unified API for network calls, notifications, and essential micro-frontend features.",
        "Built a hybrid mobile application leveraging Flutter and React, enhancing cross-platform compatibility and user experience.",
      ],
    },
    {
      title: "Software Engineer - Frontend",
      company: "Innoplexus Consulting Services Pvt Ltd",
      duration: [new Date(2017, 10, 1), new Date(2019, 9, 1)],
      area: "Pune, India",
      description: "",
      techStack: [
        "React",
        "Node.js",
        "Django",
        "Express",
        "Elasticsearch",
        "MongoDB",
        "Python",
      ],
      tasks: [
        "Led a team of 2–3 developers to design and develop client-facing data analytics dashboards, utilizing React and D3.js for interactive visualizations.",
        "Developed API services from scratch using Express, Django, Elasticsearch, and MongoDB, ensuring seamless backend functionality.",
        "Designed and built dashboards for patent analysis, enhancing data accessibility and strategic decision-making.",
        "Developed data processing pipelines to calculate Simple and Extended Patent Family statistics, leveraging MongoDB and Pandas for large-scale data handling.",
      ],
    },
    {
      title: "CoFounder",
      company: "Pole8",
      duration: [new Date(2017, 5, 1), new Date(2017, 10, 1)],
      area: "Nagpur, India",
      techStack: [
        "Semantic UI",
        "Django",
        "PostgresSQL",
        "Leaflet",
        "JQuery",
        "Python",
      ],
      description:
        "Platform focused towards documentation in the infrastructure industry. Aimed to reduce monitoring overhead by providing geotagged insights from given data",
      tasks: [
        "Developed a Django-based application that visualizes and represents coordinate collections on a map using Leaflet.js.",
        "Implemented a location clustering algorithm to efficiently group user images based on geographic proximity.",
        "Built an Android application enabling users to capture geotagged images, leveraging hardware sensors for direction and geo-location accuracy.",
      ],
    },
    {
      title: "CoFounder",
      company: "Vritt",
      techStack: [
        "Semantic UI",
        "Django",
        "PostgresSQL",
        "Stanford-NER",
        "NLTK",
        "Polyglot",
        "JQuery",
        "Python",
      ],
      duration: [new Date(2016, 5, 1), new Date(2017, 5, 1)],
      area: "Nagpur, India",
      description:
        "Platform for automatically extracting and keywords from news and building news topical timelines to help keep track of interests of readers",
      tasks: [
        "Integrated Natural Language Processing (NLP) libraries such as Stanford NER, NLTK, and Polyglot within a Django-based application to enhance data processing capabilities.",
        "Developed web crawlers for automated data curation, leveraging RSS feeds and crawling techniques to gather and structure information efficiently.",
        "Designed and built a responsive website using Django templates and modern CSS frameworks like Semantic UI, ensuring an intuitive user experience.",
      ],
    },
  ],
  projects: [
    {
      title: "A3 Ultimate Account Control Panel",
      company: "A3 Ultimate Games",
      link: "https://github.com/Vikram-Sangat/a3-ultimate-acp",
      techStack: ["Bootstrap", "MySql", "PHP", "MSSQL", "CodeIgniter"],
      tasks: [
        "Created platform to manage in-game purchases and account management via web application",
        "Integrated Paypal and PayU Money payment's services for in-game items purchase",
        "Created blogging system form players to share their experience with others players",
      ],
    },
    {
      title: "A3 Ultimate game client updater",
      company: "A3 Ultimate Games",
      link: "https://github.com/Vikram-Sangat/A3-Client-Updater",
      techStack: ["C#", "MD5"],
      tasks: [
        "Created client updated application for generating on the fly updates and new features to players.",
        "Integrated MD5 Checksum generation and validation for updating new patch files.",
      ],
    },
    {
      title: "Transwise",
      company: "Tiru Ghisewad - Transwise",
      link: "https://github.com/Vikram-Sangat/transwise-client-app",
      techStack: ["Bootstrap", "MySql", "PHP", "CodeIgniter"],
      tasks: [
        "Transwise is a platform for book rental cars as well as rent drivers.",
        "Integrated receipts tax calculations ,scheduling emails on each trip complete and printing.",
      ],
    },
  ],
};
const r = RESUME;
export default r;
