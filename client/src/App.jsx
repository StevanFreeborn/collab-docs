import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import TextEditor from './components/TextEditor.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path='/'
          element={<Navigate to={`/documents/${uuidv4()}`} />}
        />
        <Route
          path='/documents/:id'
          element={<TextEditor />}
        />
      </Routes>
    </Router>
  );
}

export default App;
