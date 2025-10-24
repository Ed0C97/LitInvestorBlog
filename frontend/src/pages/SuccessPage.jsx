// LitInvestorBlog-frontend/src/pages/SuccessPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { CheckCircle } from 'lucide-react';

const SuccessPage = () => (
  <div className="min-h-screen bg-white flex items-center justify-center px-[1rem]">
    <div className="text-center max-w-md">
      <CheckCircle className="w-[4rem] h-[4rem] text-green mx-auto mb-[1.5rem]" />
      <h1 className="text-3xl font-bold text-antracite mb-[1rem]">Payment Successful!</h1>
      <p className="text-dark-gray mb-[2rem]">
        Thank you so much for your donation. Your support is invaluable!
      </p>
      <Button asChild variant="outline-blue">
        <Link to="/">
          Back to Home
        </Link>
      </Button>
    </div>
  </div>
);

export default SuccessPage;
