import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginSignup from './pages/LoginSignup';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import ModeratorDashboard from './pages/ModeratorDashboard';
import Trending from './pages/Trending';
import Navbar from './components/Navbar';

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/mod" element={<ModeratorDashboard />} />
          <Route path="/trending" element={<Trending />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
