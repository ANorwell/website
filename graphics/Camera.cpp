#include "Camera.h"
			
Camera::Camera() {
  position.x = 0;
  position.y = 0;
  position.z = 1;
  
  up.x = 0.0f;
  up.y = 1.0f;
  up.z = 0.0f;

  look.x = 0;
  look.y = 0;
  look.z = -1;

  dt = 0.0f;
  QueryPerformanceFrequency((LARGE_INTEGER*)&freq);
  QueryPerformanceCounter((LARGE_INTEGER*)&lastUpdate_);

}


void Camera::moveForward(float speed) {
  //look has norm 1, so we do not need to normalize
  position = position + look*(dt*speed);
  moved_ = true;
}

void Camera::moveLeft(float speed) {
  
  Vec left  = up.cross(look);
  left.normalize();
  position = position + left*(dt*speed);
  moved_ = true;
}

//rotate to the left around up
void Camera::rotateLeft(float aSpeed) {
  look = look.rotate(up, dt*aSpeed);
  moved_ = true;
}

//rotate upwards, around up x look
void Camera::rotateUp(float aSpeed) {
  Vec left = look.cross(up);
  look = look.rotate(left, dt*aSpeed);
  up = up.rotate(left, dt*aSpeed);

  moved_ = true;
}

void Camera::translate(float dx, float dy, float dz) {
  position.x += dx;
  position.y += dy;
  position.z += dz;
  moved_ = true;
}


//move at an angle of angle in the {up x forward, forward} plane, 
//where angle=0 would be motion to the right, 
void Camera::move(float angle, float speed) {
  Vec right = look * up;
  Vec perp_up = right * look;

  Vec r = right.rotate(perp_up, angle);
  position = position + r*(dt*speed);
  moved_ = true;

}


void Camera::placeCamera() {
  gluLookAt(
	    //position
	    position.x, position.y, position.z,
	    
	    //lookat
	    position.x + look.x, 
	    position.y + look.y, 
	    position.z + look.z,

	    //up
	    up.x, up.y, up.z
	    );

}

//should be called every frame.
void Camera::update() {
  __int64 currTime;
  QueryPerformanceCounter((LARGE_INTEGER*)&currTime);
  dt = (currTime - lastUpdate_) / (float)freq;
  lastUpdate_ = currTime;

  placeCamera();
}

void Camera::setPosition(float x, float y, float z) {
  position.x = x;
  position.y = y;
  position.z = z;
}

void Camera::setLook(float x, float y, float z) {
  if (x==0 && y==0 && z==0)
    return;
  look.x = x;
  look.y = y;
  look.z = z;
  look.normalize();
}

