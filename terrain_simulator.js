let player, tr;
const CHUNK_RADIUS=64;
const IS_MOBILE=('ontouchstart' in document.documentElement);

function between(input, a, b)
{
	return a<=input && input<=b;
}
function fract(n)
{
	return n - Math.floor(n);
}
function frand(x,y)
{
	return fract(Math.sin(x * 9106.966345 + y * 3742.931314) * 49824.21294);
}

function changeBG() //The background color changes according to the real time
{
	const today = new Date();
	const offset= -today.getTimezoneOffset() * 60000;
	let t = (today.getTime() + offset)  / 86400000;
	t= fract(t) * 24;
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
		this.moveSpeed=8;
	}
	startCamera()
	{
		setCamera(this.camera);
	}
	rotateCamera_PC()
	{
		this.rotX=-constrain(map(mouseX, 0, width, -Math.PI, Math.PI), -Math.PI, Math.PI);
		this.rotY=constrain(map(mouseY, 0, height, -Math.PI/2, Math.PI/2),-Math.PI/2, Math.PI/2);
	}
	rotateCamera_mobile(deltaX, deltaY)
	{
		this.rotX-=deltaX;
		this.rotY=constrain(this.rotY+deltaY,-Math.PI/2, Math.PI/2);
	}
	move(rot)
	{
		let dir=new p5.Vector(Math.sin(this.rotX+rot), 0, Math.cos(this.rotX+rot));
		let realDir=new p5.Vector(dir.x*this.moveSpeed, 0, dir.z*this.moveSpeed);
		this.pos.add(realDir);
	}
	altitude(upDown)
	{
		this.pos.y -= upDown*this.moveSpeed;
	}
	renderCamera()
	{
		let lookAt=SCS_to_OCS(this.baseDist,this.rotX,this.rotY);
		lookAt.add(this.pos);
		this.camera.setPosition(this.pos.x, this.pos.y, this.pos.z);
		this.camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
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
		this.typeSeed=_type;
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
//		translate(mid_x, _y-0.5, mid_z);
//		box(CHUNK_RADIUS, 1, CHUNK_RADIUS);
		pop();
	}
	_plainDraw(plainCol, oceanCol)
	{
		const _y = (this.y < 0 ? 0 : this.y);
		if(this.y<0) fill(oceanCol);
		else fill(plainCol);
		this._plainPillar(_y);
	}
	_treeBase(trunkR, trunkH, leavesR, leavesH, trunkCol, leavesCol)
	{
		push();
		translate(0,-(this.y+trunkH)/2,0);
		fill(trunkCol);
		cylinder(trunkR, trunkH, 6, 1);
		translate(0,-leavesH*2/3,0);
		fill(leavesCol);
		cone(leavesR, -leavesH, 12, 1);
		pop();
	}
	_treeDraw(x,z)
	{
	}
	_treeScatter(n)
	{
		for(var i=0; i<n; i++)
		{
			let treeX=frand(this.start_x, this.typeSeed*128+i);
			let treeZ=frand(this.start_z, this.typeSeed*32-i);
			treeX=this.start_x+treeX*CHUNK_RADIUS;
			treeZ=this.start_z+treeZ*CHUNK_RADIUS;
			this._treeDraw(treeX, treeZ);
		}
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
	_treeDraw(_x,_z)
	{
		const trunkR=CHUNK_RADIUS/20;
		const trunkH=CHUNK_RADIUS/3;
		push();
		translate(_x,-(this.y+trunkH)/2,_z);
		fill("#633331");
		cylinder(trunkR, trunkH, 6, 1);
		translate(0,-trunkH*2/3,0);
		fill("#1a7d56");
		cone(trunkR*3, -trunkH, 12, 1);
		translate(0,-trunkH/2,0);
		fill("#c8edf7");
		cone(trunkR*3, -trunkH, 12, 1);
		pop();
	}
	render()
	{
		super._plainDraw(SnowyTaigaRenderer._plain_color, SnowyTaigaRenderer._ocean_color);
		if(this.y >=0 )
		{
			if(this.type == 1) this._treeScatter(1);
			else if(this.type ==2) this._treeScatter(5);
		}
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
	_treeDraw(_x,_z)
	{
		push();
		translate(_x, 0, _z);
		super._treeBase(CHUNK_RADIUS/20, CHUNK_RADIUS/3, CHUNK_RADIUS*3/16, CHUNK_RADIUS/3, "#633331", "#1a7d56");
		pop();
	}
	render()
	{
		super._plainDraw(TaigaRenderer._plain_color, TaigaRenderer._ocean_color);
		if(this.y >=0 )
		{
			if(this.type == 1) this._treeScatter(1);
			else if(this.type ==2) this._treeScatter(5);
		}
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
	_treeDraw(_x,_z)
	{
		push();
		translate(_x, 0, _z);
		super._treeBase(CHUNK_RADIUS/16, CHUNK_RADIUS/4, CHUNK_RADIUS*3/16, CHUNK_RADIUS/4, "#b77b2f", "#47b72f");
		pop();
	}
	render()
	{
		super._plainDraw(PlainRenderer._plain_color, PlainRenderer._ocean_color);
		if(this.y >=0 )
		{
			if(this.type == 1) this._treeScatter(1);
			else if(this.type ==2) this._treeScatter(5);
		}
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
	_treeDraw(_x,_z)
	{
		const trunkR=CHUNK_RADIUS/20;
		const trunkH=CHUNK_RADIUS/4;
		push();
		translate(_x,-(this.y+trunkH)/2,_z);
		fill("#8f8576");
		cylinder(trunkR, trunkH, 6, 1);
		translate(0,-trunkR*2,0);
		fill("#acc764");
		sphere(trunkR*2, 8, 6);
		pop();
	}
	render()
	{
		super._plainDraw(SavannaRenderer._plain_color, SavannaRenderer._ocean_color);
		if(this.y >=0 )
		{
			if(this.type == 1) this._treeScatter(3);
			else this._treeScatter(1);
		}
	}
}
class DesertRenderer extends ChunkRenderer
{
	static _plain_color = "#ebc6a0";
	static _ocean_color = "#43eec8";
	constructor(_x, _z, _type, _y)
	{
		super(_x, _z, _type, _y);
		if(_type < 4) this.type=0;
		else if(_type < 7) this.type=1;
		else this.type=2;
	}
	_pyramidDraw(_x, _z)
	{
		const r=CHUNK_RADIUS/2;
		push();
		translate(_x,-(this.y+r)/2,_z);
		fill("#df9c47");
		cone(r,-r,4,1);
		pop();
	}
	_treeDraw(_x,_z)
	{
		const trunkR=CHUNK_RADIUS/8;
		const trunkH=CHUNK_RADIUS*3/16;
		push();
		translate(_x,-(this.y+trunkH)/2,_z);
		fill("#acc764");
		cylinder(trunkR, trunkH, 6, 1);
		translate(0,-trunkH/2,0);
		sphere(trunkR, 8, 6);
		pop();
	}
	render()
	{
		super._plainDraw(DesertRenderer._plain_color, DesertRenderer._ocean_color);
		if(this.y >=0 )
		{
			if(this.type == 1)
			{
				let pyramidX=frand(this.start_x, this.typeSeed*128);
				let pyramidZ=frand(this.start_z, this.typeSeed*32);
				pyramidX=this.start_x+pyramidX*CHUNK_RADIUS;
				pyramidZ=this.start_z+pyramidZ*CHUNK_RADIUS;
				this._pyramidDraw(pyramidX,pyramidZ);
			}
			else if(this.type ==2) this._treeScatter(3);
		}
	}
}

class TerrainRenderer
{
	constructor(amount = 16)
	{
		this.chunkAmount=amount;
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
		const noiseScale=0.04;
		const landFactor= 78329;
		const oceanFactor= 993217;
		let N=this.chunkAmount;
		for(var z=-N; z<=N; z++)
		{
			for(var x=-N; x<=N; x++)
			{
				let chunk_noise=noise((x+cx)*noiseScale+landFactor, (z+cz)*noiseScale +landFactor);
				let y_noise=noise((x+cx)*noiseScale +oceanFactor, (z+cz)*noiseScale +oceanFactor);
				y_noise=map(y_noise,0,1,-100, 250);
				this._renderBiome(x+cx, z+cz, chunk_noise, y_noise);
			}
		}
	}
}
function setup()
{
	let myCanvas=createCanvas(windowWidth,windowHeight,WEBGL);
	if(IS_MOBILE) myCanvas.touchMoved(mobile_cameraMove);
	player=new Player(0,0);
	player.startCamera();
	tr=new TerrainRenderer(16);
	noStroke();
	mouseX=width/2, mouseY=height/2;
}

function draw()
{
	lights();
	directionalLight(240, 240, 240, 0.2, 1, 0.2);
	changeBG();
	if(!IS_MOBILE) player.rotateCamera_PC();

	if (keyIsDown(UP_ARROW) || keyIsDown(87)) player.move(PI);
	if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) player.move(0);
	if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) player.move(-PI/2);
	if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) player.move(PI/2);
	if (keyIsDown(32)) player.altitude(1);
	if (keyIsDown(SHIFT)) player.altitude(-1);
	
	player.renderCamera();
	const pos=player.getPos();
	tr.render(pos.x, pos.z);
}


function mobile_cameraMove()
{
	const mult= height < width ? height : width;
	let delta_x=(mouseX - pmouseX) / mult;
	let delta_y=(mouseY - pmouseY) / mult;
	player.rotateCamera_mobile(delta_x, delta_y);
}



function windowResized()
{
	resizeCanvas(windowWidth, windowHeight, false);
	player.renderCamera();
}
