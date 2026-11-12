'use strict';
/* Original TOEIC-style practice: shared workplace extension bank, not an official test. */
(()=>{
const bank=window.WORKPLACE_CONTENT;
const pictureRows=[
['telephone','A telephone is available for making calls.','A printer is producing documents.','A calculator is beside a cash register.','A scanner is copying a page.'],
['pen','A writing instrument is shown.','A pair of scissors is shown.','A measuring tape is shown.','A computer cable is shown.'],
['pencil','A pencil can be used to make handwritten notes.','A screwdriver is being used to tighten a screw.','A paintbrush has been dipped into paint.','A key has been inserted into a lock.'],
['book','A book is shown as reading material.','A keyboard is attached to a monitor.','A folder is being shredded.','A parcel is being weighed.'],
['desk','A desk provides a surface for work.','A bed has been prepared for a guest.','A cooking surface is being cleaned.','A vehicle is parked outside.'],
['computer','Computer equipment is shown.','Medical equipment is being operated.','Kitchen appliances are being repaired.','Luggage is being loaded onto a vehicle.'],
['living room','The room is arranged as a living area.','The area is designed for preparing meals.','The room is used for bathing.','The area is a factory loading bay.'],
['dining room','The room is arranged for eating meals.','The room is equipped for medical examinations.','The area is used for storing vehicles.','The room is arranged as a bedroom.'],
['kitchen','The area is intended for preparing food.','The room is a customer waiting lounge.','The area is a railway platform.','The room is used for displaying clothing.'],
['bedroom','A room is furnished for sleeping.','A room is arranged for a conference.','A room is equipped for cooking.','A room is used for banking services.'],
['bathroom','The room contains bathroom facilities.','The room is arranged as an office.','The space is used for storing groceries.','The area is a ticket counter.'],
['apple','An apple is shown.','An onion is being sliced.','A potato has been peeled.','A loaf of bread is being cut.'],
['banana','A banana is shown as a food item.','A cucumber is being chopped.','A carrot is on a cutting board.','A bowl contains several eggs.'],
['bread','Bread is shown as a food item.','Rice is being poured into a container.','Cheese is being grated.','Meat is cooking in a pan.'],
['coffee','A coffee drink is shown.','A bowl is filled with soup.','A bottle contains cooking oil.','A glass is filled with orange juice.'],
['shirt','A shirt is shown as an item of clothing.','A pair of trousers is being folded.','A coat is being repaired.','A scarf is wrapped around a bag.'],
['shoes','Footwear is shown.','Gloves are arranged on a shelf.','Hats are displayed in a window.','Belts are hanging from a rack.'],
['bag','A bag can be used to carry personal items.','A cabinet is used to store files.','A cart is used to move equipment.','A tray is used to serve food.'],
['train','Rail transportation is depicted.','Passengers are traveling by boat.','An aircraft is being refueled.','A truck is parked at a warehouse.'],
['airplane','An aircraft is depicted.','A train is crossing a bridge.','A ship is approaching a harbor.','A bus is stopping at an intersection.'],
['clock','A device for telling time is shown.','A device for measuring weight is shown.','A device for checking temperature is shown.','A device for scanning bar codes is shown.'],
['car','A passenger vehicle is shown.','A bicycle is leaning against a wall.','A forklift is lifting a pallet.','A train is entering a station.'],
['chair','A chair provides a place to sit.','A cabinet provides storage for tools.','A ladder provides access to a roof.','A counter is used for serving meals.'],
['key','A key is shown.','A pen is being used to sign a form.','A cable is connected to a computer.','A knife is being used to cut bread.'],
['reading','A person is engaged in reading.','A person is repairing an engine.','A person is unloading a truck.','A person is preparing vegetables.'],
['cooking','Food is being prepared.','An instrument is being played.','Clothing is being folded.','A package is being delivered.'],
['swimming','A person is swimming in a pool.','A person is jogging along a path.','A person is rowing a boat.','A person is standing at a reception desk.'],
['playing the piano','A person is playing a keyboard instrument.','A person is repairing a printer.','A person is typing a report on a computer.','A person is examining a drawing.']
];
const wrap=(a,start,count)=>Array.from({length:count},(_,i)=>a[(start+i)%a.length]);
const byTopic=Object.fromEntries(bank.cases.map(c=>[c.unit,c]));
function casesFor(index,offset=0){const indices=[index,(index+7+offset)%30,(index+13+offset)%30,(index+19+offset)%30,(index+25+offset)%30];return [...new Set(indices)].map(i=>bank.cases[i]);}
function comprehension(cases,type){return cases.flatMap(c=>c.questions.map((q,i)=>({...q,id:`x2:${type}:${c.id}:${i}`,type,passage:c.text,passageTitle:c.title,group:c.id,audio:type==='listening'?c.text:undefined,why:q.why})));}
window.COURSE_EXAMS=Object.fromEntries(window.FULL_COURSE.map((u,index)=>{
 const grammar=[...bank.grammar[u.id].map((q,i)=>({...q,id:`x2:g:${u.id}:${i}`,type:'grammar'})),...wrap(bank.grammar.advanced,index*3,10).map(q=>({...q,id:`x2:a:${bank.grammar.advanced.indexOf(q)}`,type:'grammar'}))];
 const reading=comprehension(casesFor(index),'reading');
 const listening=comprehension(casesFor(index,2),'listening');
 const dialogue=wrap(bank.responses,index*2,20).map(q=>({...q,id:`x2:d:${bank.responses.indexOf(q)}`,type:'dialogue',audio:q.q}));
 const spelling=wrap(bank.vocab,index*2,20).map(w=>({id:`x2:s:${w.en}`,type:'spelling',q:`${w.sentence}\n提示：${w.zh}`,answer:w.en,why:`${w.en}＝${w.zh}。${w.sentence.replace('___',w.en)}`}));
 // Each round uses distinct images. Related unit vocabulary comes first, followed by workplace review.
 const related=pictureRows.filter(r=>u.words.some(w=>w.en===r[0]));
 const rows=[...related,...wrap(pictureRows,index,28).filter(r=>!related.includes(r))].slice(0,20);
 const picture=rows.map(r=>({id:`x2:p:${r[0]}`,en:r[0],type:'picture',asset:window.AT35_DATA.words[r[0]].asset,q:'Choose the statement that best describes the image.',answer:r[1],choices:r.slice(1),why:`圖片重點：${window.AT35_DATA.words[r[0]].zh}。${r[1]}`}));
 return [u.id,{grammar,listening,dialogue,spelling,picture,reading}];
}));
})();
