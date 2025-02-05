import clsx from 'clsx';
import React from 'react';

interface StatCardProps {
  type: 'students' | 'updateStudent' | 'deleteStudent';
  count: number;
  label: string;
  icon: string;
}

const StatCard = ({ count = 0, label, icon, type }: StatCardProps) => {
  return (
    <div
      className={clsx('stat-card', {
        'bg-students': type === 'students',
        'bg-updateStudent': type === 'updateStudent',
        'bg-deleteStudent': type === 'deleteStudent',
      })}
    >
      <div className="stat-card-content">
        <img src={icon} alt={label} className="stat-card-icon" />
        <div className="stat-card-text">
          <h2>{label}</h2>
          <p>{count}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
