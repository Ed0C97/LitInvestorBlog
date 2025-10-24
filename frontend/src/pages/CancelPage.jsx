// LitInvestorBlog-frontend/src/pages/CancelPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { XCircle } from 'lucide-react';

const CancelPage = () => (
  <div className="min-h-screen bg-white flex items-center justify-center px-[1rem]">
    <div className="text-center max-w-md">
      <XCircle className="w-[4rem] h-[4rem] text-dark-gray mx-auto mb-[1.5rem]" />
      <h1 className="text-3xl font-bold text-antracite mb-[1rem]">Payment Canceled</h1>
      <p className="text-dark-gray mb-[2rem]">
        The donation was canceled. You can try again at any time.
      </p>
      <Button asChild variant="outline-gray">
        <Link to="/donate">
          Back to Donations Page
        </Link>
      </Button>
    </div>
  </div>
);

export default CancelPage;
