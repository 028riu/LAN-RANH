import * as pc from 'playcanvas';
import { WORLD_CONFIG } from '../world/worldConfig.js';

export function createPlayer(app) {
  const spawn = WORLD_CONFIG.islands.find((island) => island.id === WORLD_CONFIG.spawnIslandId);
  const groundY = (spawn?.elevation ?? 0) + (spawn?.height ?? 10) + 1.8;
  const spawnX = spawn?.x ?? 0;
  const spawnZ = spawn?.z ?? 0;
  const material = new pc.StandardMaterial();
  material.diffuse = new pc.Color(0.16,0.28,0.48);
  material.metalness = 0.08;
  material.roughness = 0.55;
  material.update();

  const entity = new pc.Entity('Player');
  entity.addComponent('render',{type:'capsule',material});
  entity.setPosition(spawnX,groundY,spawnZ+4);
  entity.setLocalScale(0.85,1.15,0.85);
  app.root.addChild(entity);

  const face = new pc.Entity('Player Face');
  face.addComponent('render',{type:'sphere'});
  face.setLocalScale(0.62,0.62,0.62);
  face.setPosition(0,0.93,-0.12);
  entity.addChild(face);

  let verticalVelocity=0;
  let grounded=true;
  const speed=7.2;
  const gravity=19;
  let walkTime=0;

  return {
    entity,
    update(dt,input,yaw) {
      const forward=Number(input.forward)-Number(input.backward);
      const sideways=Number(input.right)-Number(input.left);
      const magnitude=Math.hypot(forward,sideways);
      if(magnitude>0) {
        const f=forward/magnitude, s=sideways/magnitude;
        const sin=Math.sin(yaw), cos=Math.cos(yaw);
        const dx=s*cos-f*sin, dz=-f*cos-s*sin;
        const velocity=speed*(input.sprint?1.55:1);
        entity.translate(dx*velocity*dt,0,dz*velocity*dt);
        entity.setEulerAngles(0,Math.atan2(dx,dz)*180/Math.PI+180,0);
        walkTime+=dt*(input.sprint?13:9);
        entity.setLocalPosition(entity.getLocalPosition().x,
          groundY+Math.abs(Math.sin(walkTime))*0.07,entity.getLocalPosition().z);
      }
      if(input.jump&&grounded){verticalVelocity=7.2;grounded=false;}
      verticalVelocity-=gravity*dt;
      const pos=entity.getPosition(), nextY=pos.y+verticalVelocity*dt;
      if(nextY<=groundY){entity.setPosition(pos.x,groundY,pos.z);verticalVelocity=0;grounded=true;}
      else entity.setPosition(pos.x,nextY,pos.z);

      // Temporary starter-island boundary until swimming and boat travel are implemented.
      const p=entity.getPosition(), dx=p.x-spawnX, dz=p.z-spawnZ;
      const distance=Math.hypot(dx,dz);
      const radius=Math.min(spawn.width,spawn.depth)*0.47;
      if(distance>radius){const factor=radius/distance;entity.setPosition(spawnX+dx*factor,p.y,spawnZ+dz*factor);}
    }
  };
}
