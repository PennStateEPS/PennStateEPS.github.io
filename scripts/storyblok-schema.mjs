// Declarative Storyblok schema. Preserves existing data and adds missing fields.
const text=(pos,description='')=>({type:'text',pos,description});
const textarea=(pos,description='')=>({type:'textarea',pos,description});
const asset=(pos)=>({type:'asset',pos,filetypes:['images']});
const blocks=(pos,whitelist)=>({type:'bloks',pos,restrict_components:true,component_whitelist:whitelist});
const sectionNames=['hero','about_section','events_section','highlights_section','archive_section','partners_section','team_section','join_section','contact_section'];
const nest=(name,display_name,schema)=>({name,display_name,is_root:false,is_nestable:true,schema});
export const components=[
  {name:'page',display_name:'Page',is_root:true,is_nestable:false,schema:{
    body:blocks(0,sectionNames),
    full_cms_layout:{type:'boolean',pos:1,description:'Use drag-and-drop Body order as the complete website layout. Do not disable after initial setup.'},
  }},
  nest('hero','Homepage Hero',{
    eyebrow:text(0),headline:text(1),highlight:text(2),description:textarea(3),
    primary_button_text:text(4),primary_button_url:text(5),secondary_button_text:text(6),secondary_button_url:text(7)
  }),
  nest('mission_card','Mission Card',{
    title:text(0),description:textarea(1),icon:{type:'option',pos:2,
      options:[{name:'Learn / Bolt',value:'bolt'},{name:'People / Community',value:'people'},{name:'Layers / Growth',value:'layers'}]}
  }),
  nest('about_section','About the Chapter',{
    eyebrow:text(0),heading:text(1),description:textarea(2),pillars:blocks(3,['mission_card'])
  }),
  nest('events_section','Events & Calendar',{title:text(0),description:textarea(1)}),
  nest('highlight_item','Past Event Highlight',{
    title:text(0),date:text(1,'e.g. 22 Oct 2026'),description:textarea(2),
    image:asset(3),link:text(4,'Public album URL (https://...)')
  }),
  nest('highlights_section','Highlights & Photos',{
    title:text(0),description:textarea(1),items:blocks(2,['highlight_item'])
  }),
  nest('archive_section','Past Events Archive',{title:text(0)}),
  nest('partner_item','Partner or Sponsor',{
    name:text(0),website:text(1,'Official https:// URL'),logo:asset(2)
  }),
  nest('partners_section','Sponsorship & Partners',{
    title:text(0),description:textarea(1),partners:blocks(2,['partner_item'])
  }),
  nest('team_member','Committee Member',{
    name:text(0),role:text(1),photo:asset(2),linkedin:text(3,'Public https:// LinkedIn profile, optional')
  }),
  nest('team_section','Leadership & Committee',{
    title:text(0),description:textarea(1),advisor:text(2),people:blocks(3,['team_member'])
  }),
  nest('join_section','Join the Chapter',{
    title:text(0),description:textarea(1),button_text:text(2)
  }),
  nest('faq_item','Frequently Asked Question',{
    question:text(0),answer:textarea(1)
  }),
  nest('contact_section','Contact & FAQ',{
    title:text(0),description:textarea(1),faqs:blocks(2,['faq_item'])
  }),
];
export const sectionOrder=sectionNames;
