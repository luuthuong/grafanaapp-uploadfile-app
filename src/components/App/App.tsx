import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppRootProps } from '@grafana/data';
import { ROUTES } from '../../constants';
const PageUploadFiles = React.lazy(() => import('../../pages/UploadFiles'));

function App(props: AppRootProps) {
  return (
    <Routes>
      <Route path={ROUTES.Upload} element={<PageUploadFiles />} />
    </Routes>
  );
}

export default App;
