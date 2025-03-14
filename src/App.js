import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import './assets/css/demo.css'
import './assets/vendor/css/rtl/core.css'
import './assets/vendor/css/rtl/theme-default.css'

//import './assets/vendor/libs/@form-validation/form-validation.css'
import './assets/vendor/css/pages/page-auth.css'
import './assets/vendor/css/pages/page-profile.css'

import LogIn from './components/LogIn';
import AdminDashboard from './components/AdminDashboard';
import CandidateListView from './components/CandidateListView';
import EventApprove from './components/EventApprove';
import CandidateAddOrEdit from './components/CandidateAddOrEdit';
import ViewPage from './components/ViewPage';
import CandidateDashboard from './components/CandidateDashboard';
import CandidateEventList from './components/CandidateEventList';
import CandidateAddOrEditEvent from './components/CandidateAddOrEditEvent';
import Calendar from './components/Calender';
import Fees from './components/Fees';
import FeeAddEdit from './components/FeeAddEdit';


function App() {
  return (
    
    <Router>
    
    <Routes>
        <Route path="/" element={<Calendar />} />
        <Route path="/Login" element={<LogIn />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/Calender" element={<Calendar />} />
        <Route path="/candidate-list-view" element={<CandidateListView />} />
        <Route path="/eventapprove" element={<EventApprove />} />
        <Route path="/candidate-add-edit" element={<CandidateAddOrEdit />} />
        <Route path="/Viewpage/:candidateId" element={<ViewPage />} />
        <Route path="/candidatedashboard" element={<CandidateDashboard />} />
        <Route path="/candidate-event-list" element={<CandidateEventList />} />
        <Route path="/fees" element={<Fees />} />
        <Route path="/fees-add-edit" element={<FeeAddEdit />} />

        <Route path="/candidate-event-add-edit" element={<CandidateAddOrEditEvent />} />
        <Route path="/candidate-event-add-edit/:eventId" element={<CandidateAddOrEditEvent />} />

      </Routes>
    
  </Router>

  );
}

export default App;
