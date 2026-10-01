import { Route, Routes } from "react-router"
import Home from "./pages/home"
import Layout from "./layout/layout"
import About from "./pages/about"
import NotFound from "./pages/404"
import Books from "./pages/books"
import Blog from "./pages/blog"
import BlogPost from "./pages/blog-post"
import Portfolio from "./pages/portfolio"
import Til from "./pages/til"
import TilPost from "./pages/til-post"
import Project from "./pages/project"
import Certificates from "./pages/certificates"
import Hobbies from "./pages/hobbies"
import PrivacyPolicy from "./pages/privacy-policy"
import TermsOfUse from "./pages/terms-of-use"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* PT routes — no prefix */}
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="books" element={<Books />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="hobbies" element={<Hobbies />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="til" element={<Til />} />
        <Route path="til/:slug" element={<TilPost />} />
        <Route path="projects/:id" element={<Project />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-of-use" element={<TermsOfUse />} />

        {/* EN routes — under /en */}
        <Route path="en">
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="books" element={<Books />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="hobbies" element={<Hobbies />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="til" element={<Til />} />
          <Route path="til/:slug" element={<TilPost />} />
          <Route path="projects/:id" element={<Project />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-use" element={<TermsOfUse />} />
          {/* Unknown /en/* paths → 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
