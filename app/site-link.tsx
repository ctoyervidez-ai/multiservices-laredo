import type { ComponentProps } from 'react';

// Use document navigation: the deployed Vinext router's dynamic exports fail
// after intercepting clicks. Native anchors also work before hydration.
export default function SiteLink(props: ComponentProps<'a'>) {
  return <a {...props} />;
}
