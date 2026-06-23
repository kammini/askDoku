import { BrowserRouter, Routes, Route } from "react-router-dom"
import Ask from "./pages/Ask"
import Upload from "./pages/Upload"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route>
          <Route index element={<Upload />} />
          <Route path="ask" element={<Ask />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}