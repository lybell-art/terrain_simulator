let player, tr;
const CHUNK_RADIUS=64;

function between(input, a, b)
{
	return a<=input && input<=b;
}

function changeBG() //The background color changes according to the real time
{
	const today = new Date();
	const offset= -today.getTimezoneOffset() * 60000;
	let t = (today.getTime() + offset)  / 86400000;
	t= ( t - Math.floor(t) ) * 24;
	let col;
	let myLerpColor=function(col1, col2, time1, time2){return lerpColor(color(col1), color(col2), map(t, time1, time2, 0, 1));}
	if(between(t,8,13)) col=myLerpColor("#D3EDFF", "#53B9FF", 8, 13);
	else if(between(t,13,18)) col=myLerpColor("#53B9FF", "#E1EAED", 13, 18);
	else if(between(t,18,18.5)) col=myLerpColor("#E1EAED", "#FAC275", 18, 18.5);
	else if(between(t,18.5,19)) col=myLerpColor("#FAC275", "#FA6F6E", 18.5, 19);
	else if(between(t,19,20)) col=myLerpColor("#FA6F6E", "#483E8C", 19, 20);
	else if(between(t,20,24)) col=myLerpColor("#483E8C", "#142740", 20, 24);
	else if(between(t,0,5)) col=color("#142740");
	else if(between(t,5,6)) col=myLerpColor("#142740", "#8F77F3", 5, 6);
	else if(between(t,6,6.5)) col=myLerpColor("#8F77F3", "#FDABB5", 6, 6.5);
	else if(between(t,6.5,7)) col=myLerpColor("#FDABB5", "#F5E6CB", 6.5, 7);
	else col=myLerpColor("#F5E6CB", "#D3EDFF", 7, 8);
	
	background(col);
}

function SCS_to_OCS(radius, xRot, yRot)
{
	yRot -= Math.PI/2;
	return new p5.Vector( radius*Math.sin(xRot)*Math.sin(yRot), radius*Math.cos(yRot), radius*Math.cos(xRot)*Math.sin(yRot) );
}

class Player
{
	constructor(x,y)
	{
		this.camera=createCamera();
		this.pos=new p5.Vector(x,-300, y);
		this.baseDist=height / 2 / tan((30 * PI) / 180);
		this.rotX=0;
		this.rotY=0;
	}
	startCamera()
	{
		setCamera(this.camera);
	}
	renderCamera()
	{
		let lookAt=SCS_to_OCS(this.baseDist,this.rotX,this.rotY);
		console.log(lookAt);
		lookAt.add(this.pos);
		console.log(lookAt);
		this.camera.setPosition(this.pos.x, this.pos.y, this.pos.z);
		this.camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
		console.log(this.camera);
	}
	getPos()
	{
		return {x:parseInt(this.pos.x/CHUNK_RADIUS), z:parseInt(this.pos.z/CHUNK_RADIUS)};
	}
}

class ChunkRenderer
{
	static _below=100;
	constructor(_x, _z, _type, _y)
	{
		this.start_x=_x*CHUNK_RADIUS;
		this.end_x=(_x+1)*CHUNK_RADIUS;
		this.start_z=_z*CHUNK_RADIUS;
		this.end_z=(_z+1)*CHUNK_RADIUS;
		this.type=0;
		this.y=_y;
	}
	_plainPillar(_y)
	{
		const mid_x = (this.start_x + this.end_x) /2;
		const mid_z = (this.start_z + this.end_z) /2;
		const BELOW=100;
		push();
		translate(mid_x, (BELOW-_y)/2, mid_z);
		box(CHUNK_RADIUS, BELOW+_y, CHUNK_RADIUS);
		pop();
	}
	_plainDraw(plainCol, oceanCol)
	{
		const _y = (this.y < 0 ? 0 : this.y);
		if(this.y<0) fill(oceanCol);
		else fill(plainCol);
		this._plainPillar(_y);
	}
}
class SnowyTaigaRenderer extends ChunkRenderer
{
	static _plain_color = "#f0fcff";
	static _ocean_color = "#3938c9";
	constructor(_x, _z, _type, _y)
	{
		super(_x, _z, _type, _y);
		if(_type < 2) this.type=0;
		else if(_type < 4) this.type=1;
		else this.type=2;
	}
	render()
	{
		super._plainDraw(SnowyTaigaRenderer._plain_color, SnowyTaigaRenderer._ocean_color);
	}
}
class TaigaRenderer extends ChunkRenderer
{
	static _plain_color = "#3daf7e";
	static _ocean_color = "#3a70da";
	constructor(_x, _z, _type, _y)
	{
		super(_x, _z, _type, _y);
		if(_type < 2) this.type=0;
		else if(_type < 4) this.type=1;
		else this.type=2;
	}
	render()
	{
		super._plainDraw(TaigaRenderer._plain_color, TaigaRenderer._ocean_color);
	}
}
class PlainRenderer extends ChunkRenderer
{
	static _plain_color = "#6ebd59";
	static _ocean_color = "#45adf2";
	constructor(_x, _z, _type, _y)
	{
		super(_x, _z, _type, _y);
		if(_type < 3) this.type=0;
		else if(_type < 6) this.type=1;
		else this.type=2;
	}
	render()
	{
		super._plainDraw(PlainRenderer._plain_color, PlainRenderer._ocean_color);
	}
}
class SavannaRenderer extends ChunkRenderer
{
	static _plain_color = "#acb765";
	static _ocean_color = "#43eec8";
	constructor(_x, _z, _type, _y)
	{
		super(_x, _z, _type, _y);
		if(_type < 6) this.type=0;
		else this.type=1;
	}
	render()
	{
		super._plainDraw(SavannaRenderer._plain_color, SavannaRenderer._ocean_color);
	}
}
class DesertRenderer extends ChunkRenderer
{
	static _plain_color = "#ebc6a0";
	static _ocean_color = "#43eec8";
	constructor(_x, _z, _type, _y)
	{
		super(_x, _z, _type, _y);
		if(_type < 5) this.type=0;
		else if(_type < 7) this.type=1;
		else this.type=2;
	}
	render()
	{
		super._plainDraw(DesertRenderer._plain_color, DesertRenderer._ocean_color);
	}
}

class TerrainRenderer
{
	constructor()
	{
		this.chunkAmount=12;
	}
	_getBiome(noise)
	{
		if(between(noise,0,0.1)) return SnowyTaigaRenderer;
		else if(between(noise,0.1,0.3)) return TaigaRenderer;
		else if(between(noise,0.3,0.6)) return PlainRenderer;
		else if(between(noise,0.6,0.8)) return SavannaRenderer;
		else return DesertRenderer;
	}
	_getBiomeType(noise)
	{
		const seed=parseInt(noise*(1 << 16));
		return seed & 7;
	}
	_renderBiome(x, z, chunk, altitude)
	{
		let biome=this._getBiome(chunk);
		const biome_hidden=this._getBiomeType(chunk);
		new biome(x,z,biome_hidden,altitude).render();
	}
	render(cx,cz)
	{
		const noiseScale=0.02;
		const landFactor= 78329;
		const oceanFactor= 993217;
		let N=this.chunkAmount;
		for(var z=-N; z<=N; z++)
		{
			for(var x=-N; x<=N; x++)
			{
				let chunk_noise=noise((x+cx)*noiseScale+landFactor, (z+cz)*noiseScale +landFactor);
				let y_noise=noise((x+cx)*noiseScale +oceanFactor, (z+cz)*noiseScale +oceanFactor);
				y_noise=map(y_noise,0,1,-50, 150);
				this._renderBiome(x, z, chunk_noise, y_noise);
			}
		}
	}
}
let mainCamera;
function setup()
{
	createCanvas(windowWidth,windowHeight,WEBGL);
	player=new Player(0,0);
	player.startCamera();
	tr=new TerrainRenderer();
//	mainCamera = createCamera();
//	setCamera(mainCamera);
//	mainCamera.setPosition(330,-480,580);
//	mainCamera.lookAt(0,-50,0);
	noLoop();
	noStroke();
}

function draw()
{
	lights();
	directionalLight(240, 240, 240, 0.2, 1, 0.2);
	changeBG();
	player.renderCamera();
//	const pos=player.getPos();
	tr.render(0,0);
}


function windowResized()
{
	resizeCanvas(windowWidth, windowHeight, false);
	player.renderCamera();
}
