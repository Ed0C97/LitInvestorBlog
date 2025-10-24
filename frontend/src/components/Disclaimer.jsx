// LitInvestorBlog-frontend/src/components/Disclaimer.jsx

import React from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { ChevronDown, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const Disclaimer = ({ variant = 'gray' }) => {
  const backgroundClass = variant === 'white' ? 'bg-trasparent' : 'bg-trasparent';

  return (
    <div
      className={cn(
        'border border-input-gray text-dark-gray text-sm rounded-xl',
        backgroundClass
      )}
    >
      <div className="container mx-auto px-[1.5rem] py-[1.5rem]">
        <Collapsible>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <p className="flex-grow md:pr-[1rem]">
              <span className="font-semibold">Disclaimer:</span> The content on this blog is for informational purposes only and does not constitute financial advice.
            </p>

            <CollapsibleTrigger asChild>
              <span className="flex-shrink-0 flex items-center text-blue hover:underline cursor-pointer font-medium group mt-[0.75rem] md:mt-0 self-end md:self-auto">
                Read more
                <ChevronDown className="w-[1rem] h-[1rem] ml-[0.25rem] transition-transform duration-300 group-data-[state=open]:rotate-180" />
              </span>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="mt-[1rem] pt-[1rem] border-t border-input-gray space-y-3">
              <h3 className="font-bold text-base text-antracite">Important Notice</h3>
              <p>
                The information contained in this blog is for informational and educational purposes only. The content does not constitute financial, legal, tax, or any other professional advice, nor an invitation or recommendation to buy or sell financial instruments or investment products.
              </p>
              <p>
                The author and/or any collaborators are not responsible for any losses, damages, or consequences arising, directly or indirectly, from the use of the information published. Before making any financial or investment decisions, it is recommended to consult a qualified and independent financial advisor authorized by the competent authorities.
              </p>
              <p>
                Use of the blog content implies full acceptance of this disclaimer.
              </p>
              <a
                href="/terms-and-conditions"
                className="inline-flex items-center text-blue hover:underline font-medium pt-[0.5rem]"
              >
                <ChevronsRight className="w-[1rem] h-[1rem] mr-[0.25rem]" />
                For more information, read the Terms and Conditions
              </a>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default Disclaimer;

