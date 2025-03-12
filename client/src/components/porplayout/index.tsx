import React from 'react';
import './index.css';
import { Outlet } from 'react-router-dom';
import SideBarNav from '../main/sideBarNav';
import Header from '../header';

/**
 * Main component represents the layout of the main page, including a sidebar and the main content area.
 */
const PorpLayout = () => (
  <>
    <div id='main' className='main'>
      <Outlet />
    </div>
  </>
);

export default PorpLayout;
