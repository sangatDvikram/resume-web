import { toIn, toPt } from "../utils/style";
import yearsOfExperience from "./date";
export const CAREER_START_DATE = new Date(2016, 6, 1);
export const LINKEDIN_URL = "https://www.linkedin.com/in/sangatdvikram/"
export const URL = "https://vikram-resume.vercel.app/"
export const GITHUB_URL = "https://github.com/sangatDvikram"
export const GRAVATAR =
  "https://www.gravatar.com/avatar/7384e1fc27b2c82cc01ab728f681f326";
export const PROFILE = {
  name: "Vikram Dilip Sangat",
  title:
    "Senior Software Enginner - React | Python | Node.js | Flutter",
  description:
    `With ${yearsOfExperience()} of industry experience and ${yearsOfExperience(new Date(2012,2,1),CAREER_START_DATE)} of freelancing expertise, I bring a strong technical background in frontend development, hybrid mobile applications, and backend services. Beyond coding, I excel in leading and managing development teams throughout the software lifecycle, ensuring high-quality delivery and innovation. My experience includes developing mobile applications and data analysis dashboards, where I also secured multiple patents for my contributions. Passionate about cutting-edge technologies and scalable solutions, I am eager to explore diverse opportunities in application development—from architecture design to hands-on development.`,
  favicon: {
    url: `${GRAVATAR}?s=500`,
  },
  contact_details: [
    { type: "phone", details: "+919503415652", link: "tel:+919503415652" },
    {
      type: "email",
      details: "v.sangat98@gmail.com",
      link: "mailto:v.sangat98@gmail.com",
    },
    { type: "location", details: "Bangalore, India" },
    { type: "linkedIn", link: LINKEDIN_URL },
    { type: "github", link: GITHUB_URL },
    { type: "website", link: URL},
  ],
};

export const PRIMARY_COLOR = "#35baf6";
export const PRIMARY_COLOR_LIGHT = "#b3e5fc";
export const PRIMARY_COLOR_DARK = "#03a9f4";
export const PRIMARY_COLOR_DARKER = "#0276aa";
export const PRIMARY_FONT = "Lato";
export const PAGE_WIDTH = toIn(8.3 / 8);
export const PAGE_HEIGHT = toIn(11.7 / 8);
export const PAGE_PADDING_PT = toPt({ all: 3});
export const PAGE_FONT_SIZE = toPt({all : 1});
export enum KEYMAPPING {
  name = "profile.name",
  title = "profile.title",
  description = "profile.description",
  favicon = "profile.favicon.url",
  patents = "patents",
  contact_details = "profile.contact_details",
}
