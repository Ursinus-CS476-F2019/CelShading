precision mediump float;

attribute vec3 vPos;
attribute vec3 vNormal;

uniform mat4 uTMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

uniform vec3 uEye;

void main(void) {
    gl_Position = uPMatrix * uMVMatrix * uTMatrix * vec4(vPos, 1.0);

    vec3 N = normalize(uNMatrix*vNormal);
    vec4 x4 = uTMatrix * vec4(vPos, 1.0);
    vec3 x = x4.xyz;
    vec3 e = normalize(uEye - x);

    if(dot(e,N) > 0.0){
        gl_Position[2] = 1.0e+8; 
    }
    
    // TODO:
    // The below the depth coordiante to something very large
    // You should only do this for front facing lines, so that
    // the back ones are drawn
    float check = dot(vPos,vNormal);


}
