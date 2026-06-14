import React from 'react';
import Button from '../ui/Button';

const CTA: React.FC = () => {
  return (
    <section className="py-16 bg-blue-600">
      {/* Replaced custom <Container> with the exact shared layout spacing classes 
        to keep the left and right alignment completely unified across all sections.
      */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Ready to speak French with confidence?</h2>
          <p className="text-blue-100">Join a batch today and start your journey toward fluency.</p>
        </div>
        <div className="flex gap-4 shrink-0">
          <Button variant="secondary">Join a Batch</Button>
          <Button variant="outline">Consultation</Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;