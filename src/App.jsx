import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Demo41 from './pages/Demo41';
import Demo42 from './pages/Demo42';
import Demo43 from './pages/Demo43';
import Demo44 from './pages/Demo44';
import Demo45 from './pages/Demo45';
import Demo46 from './pages/Demo46';
import Demo47 from './pages/Demo47';
import Demo48 from './pages/Demo48';
import Section51 from './pages/Section51';
import Section52 from './pages/Section52';
import Demo56 from './pages/Demo56';
import Section54 from './pages/Section54';
import Section55 from './pages/Section55';
import Section56 from './pages/Section56';
import Section57 from './pages/Section57';
import Section58 from './pages/Section58';
import Section59 from './pages/Section59';
import Demo55 from './pages/Demo55';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Layout />}>
        <Route path="/demos" element={<Home />} />
        <Route path="/4.1" element={<Demo41 />} />
        <Route path="/4.2" element={<Demo42 />} />
        <Route path="/4.3" element={<Demo43 />} />
        <Route path="/4.4" element={<Demo44 />} />
        <Route path="/4.5" element={<Demo45 />} />
        <Route path="/4.6" element={<Demo46 />} />
        <Route path="/4.7" element={<Demo47 />} />
        <Route path="/4.8" element={<Demo48 />} />
        <Route path="/5.1" element={<Section51 />} />
        <Route path="/5.2" element={<Section52 />} />
        <Route path="/5.3" element={<Demo56 />} />
        <Route path="/5.4" element={<Section54 />} />
        <Route path="/5.5" element={<Section55 />} />
        <Route path="/5.6" element={<Section56 />} />
        <Route path="/5.7" element={<Section57 />} />
        <Route path="/5.8" element={<Section58 />} />
        <Route path="/5.9" element={<Section59 />} />
        <Route path="/ref" element={<Demo55 />} />
      </Route>
    </Routes>
  );
}
