import type { Metadata,Viewport } from 'next';
import PortalDevice from './portal-device';
export const metadata:Metadata={manifest:'/portal.webmanifest',appleWebApp:{capable:true,title:'Multiservices',statusBarStyle:'default'},icons:{icon:[{url:'/favicon.svg?v=multiservices',type:'image/svg+xml'},{url:'/favicon.ico?v=multiservices',sizes:'any'}],apple:'/apple-touch-icon.png'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#082f57'};
export default function PortalLayout({children}:{children:React.ReactNode}){return <>{children}<PortalDevice/></>;}
