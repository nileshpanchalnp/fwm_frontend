import React from 'react';
import SectionHeading from '../ui/SectionHeading';
import Card from '../ui/Card';
import { FileText, PlayCircle, Download } from 'lucide-react';

const Resources: React.FC = () => {
  const resources = [
    { title: "Sample Materials", icon: <FileText />, desc: "Access curated French worksheets." },
    { title: "Demo Sessions", icon: <PlayCircle />, desc: "Explore our teaching style via video." },
    { title: "Course Info", icon: <Download />, desc: "Download the full roadmap PDF." }
  ];

  return (
    <section id="resources" className="py-20 bg-gray-50">
      {/* Replaced the rigid <Container> component wrapper with the exact layout matching string 
        utilized within your responsive Hero and Navbar configurations.
      */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        
        {/* Title is unedited and handles centering naturally via your SectionHeading asset */}
        <SectionHeading 
          title="Explore Our Resources" 
          subtitle="Start your journey with these free learning tools." 
        />
        
        {/* Resource Cards Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resources.map((item, i) => (
            <Card key={i} className="group cursor-pointer">
              <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                {React.cloneElement(item.icon as React.ReactElement, { size: 40 })}
              </div>
              <h4 className="text-xl font-bold mb-2">{item.title}</h4>
              <p className="text-gray-500 text-sm mb-4">{item.desc}</p>
              <span className="text-blue-600 text-xs font-bold uppercase tracking-widest border-b-2 border-blue-100 group-hover:border-blue-600 transition-all">
                Access Now
              </span>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Resources;

