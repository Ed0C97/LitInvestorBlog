// LitInvestorBlog-frontend/src/components/ArticleContacts.jsx

import React from 'react';
import {Linkedin} from 'lucide-react';

const ArticleContacts = ({ name, email, linkedinUrl }) => {
  if (!name || !email) {
    return null;
  }

  return (
    <div className="my-[3rem] py-[3.5rem] border-y border-input-gray">
      <h3 className="text-2xl font-bold mb-[1.75rem] text-antracite">Author Contact</h3>

      <div className="flex flex-col">
        <div className="flex flex-col gap-[0rem]">
          <p className="font-semibold text-lg text-antracite">{name}</p>
          <p className="text-md text-dark-gray">Lit Investor</p>
          <a
            href={`mailto:${email}`}
            className="block text-blue hover:underline transition-colors"
          >
            {email}
          </a>
        </div>

        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name}'s LinkedIn profile`}
            className="inline-block mt-[0.75rem]"
          >
            <Linkedin className="w-[1.5rem] h-[1.5rem] text-dark-gray hover:text-blue transition-colors" />
          </a>
        )}
      </div>
    </div>
  );
};

export default ArticleContacts;

