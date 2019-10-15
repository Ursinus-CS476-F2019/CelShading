/*precision mediump float;

uniform mat4 tMatrix;
uniform mat3 uNMatrix;

// Camera properties
uniform vec3 uEye;

varying vec3 V; // Untransformed Position, Interpolated
varying vec3 N; // Untransformed Normal, Interpolated

void main(void) {
    vec4 p4 = tMatrix*vec4(V, 1.0);
    vec3 P = p4.xyz;
    vec3 NT = normalize(uNMatrix*N);
    vec3 v = uEye - P;
    if (dot(v, NT) < 0.0) {
        // Only draw edges on back faces
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
    //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}*/

precision mediump float;

void main(void) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}