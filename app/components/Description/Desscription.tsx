import React, { useState } from 'react';

interface DescriptionProps {
  description: string;
}

const Description: React.FC<DescriptionProps> = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      onClick={toggleExpand}
      className={`description ${isExpanded ? 'expanded' : 'collapsed'}`}
    >
      {description}

      <style jsx>{`
        .description {
          cursor: pointer;
          white-space: ${isExpanded ? 'normal' : 'nowrap'};
          overflow: hidden;
          text-overflow: ellipsis;
          display: inline-block;
          width: 100%;
          transition: white-space 0.2s ease;
        }
        .description:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Description;
