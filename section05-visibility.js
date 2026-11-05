/* Temporary SECTION 05 flag. Original HTML/data/assets remain intact.
   Remove body.section05-temporarily-hidden and reload to restore the original 04→05→06 structure. */
(() => {
 'use strict';
 if(!document.body.classList.contains('section05-temporarily-hidden')) return;
 const stack=document.querySelector('.doctor-design-stack');
 const gallery=document.querySelector('#before-after');
 const hidden=document.querySelector('#expertise.line-design-section');
 if(!stack||!gallery||!hidden)return;
 // Move the existing node (no cloning); gallery state, IDs and listeners remain singular.
 stack.append(gallery);
})();
