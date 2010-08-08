#pragma once

#include <cmath>
#include <cstdlib>
#include <cstdio>
#include <windows.h>
#include <GL/glut.h>
#include <ctime>
#include "Vec.h"

/*
  A camera class that provides relational movement functions, allowing for a
  camera that changes position easily.  
*/
class Camera {
  Vec position; //the position of the camera
  Vec up;       //the up vector of the camera
  Vec look; //the look direction, as a quaternion for easy rotation

  float dt;  //length of time since last update
  __int64 lastUpdate_; //last time of a time update (QueryPerformanceCounter)
  __int64 freq;   //the frequency of the timer
  bool moved_;
  float speed;
  float angleSpeed;

  void placeCamera();

 public:
  Camera();
 
  //Update the camera location (call every frame)
 
  //Modify the current location of the camera
  void rotate(float x, float y, float z, float angle);
  void translate(float dx, float dy, float dz);  
  void moveForward(float speed);
  void moveLeft(float speed);
  void rotateLeft(float aSpeed);
  void rotateUp(float aSpeed);
  void move(float angle, float speed);

  void update();

  //set the parameters of the camera
  void setPosition(float x, float y, float z);
  void setLook(float x, float y, float z);
  void setSpeed( float aSpeed) { speed = aSpeed; }
  void setAngleSpeed( float aSpeed) { angleSpeed = aSpeed; }

   //getters
  Vec getPos() { return position; }
  Vec getLook() { return look; }
  Vec getUp() { return up; }
  float getSpeed() { return speed;}
  float getAngleSpeed() { return angleSpeed;}

};


  
