import { Router, Route, Switch } from "wouter"
import { EpubLibrary } from "@/components/reader/EpubLibrary"
import EpubPage from "@/pages/EpubPage"

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <EpubLibrary />
        </Route>
        <Route path="/book/:id">
          <EpubPage />
        </Route>
        <Route>
          <div className="p-4">404 - Not Found</div>
        </Route>
      </Switch>
    </Router>
  )
}

export default App
