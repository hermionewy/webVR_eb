import * as d3 from 'd3';


function Graphic(){

	let W,
		H,
		m = {t:30,r:30,b:30,l:30};
	const _dis = d3.dispatch('find');


	function exports(selection){
		let datum = selection.datum() || [];

		selection.style('position','relative');

		//Build DOM from selection
		W = selection.node().clientWidth;
		H = selection.node().clientHeight;



		//Interact with external scope
		_dis.on('find',function(name){

		});
	}

	exports.find = function(name){
		//name --> journalist name
		_dis.call('find',null,name);
	}


	return exports;
}

const graphic = Graphic();

export default graphic;