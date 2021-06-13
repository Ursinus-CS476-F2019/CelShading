precision mediump float;

// Material Properties
uniform vec3 uKa; // Cool color for the material
uniform vec3 uKd; // Diffused color for the material (or warm color if doing warm/cool)
uniform vec3 uKs; // Specular color for material
uniform float uShininess; // Specular exponent for material

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 tMatrix;
uniform mat3 uNMatrix;

// Light properties
uniform vec3 uLight1Pos;
uniform vec3 uLight1Color;
uniform vec3 uLight1Atten;

// Camera properties
uniform vec3 uEye;


varying vec3 V; // Untransformed Position, Interpolated
varying vec3 N; // Untransformed Normal, Interpolated

uniform float uNumLevels; // Number of quantization levels

void main(void) {
    vec4 tpos4 = tMatrix*vec4(V, 1.0); // Transformed material location
    vec3 tpos = tpos4.xyz;
    // Unit vector from material to light
    vec3 L = uLight1Pos - tpos; 
    float LDistSqr = dot(L, L);
    L = normalize(L);
    vec3 NT = normalize(uNMatrix*N); // Transformed normal

    // Light color
    vec3 lColor = uLight1Color/(uLight1Atten.x + uLight1Atten.y*sqrt(LDistSqr) + uLight1Atten.z*LDistSqr);

    // Diffuse color
    // cool color uKa
    // warm color uKd

    float w = (1.0+dot(NT, L))/2.0;

    vec3 dColor = (w * uKd) + ((1.0-w) * uKa);

    // TODO: If you're doing cool to warm, change this
    /*
    float kdCoeff = dot(NT, L);
    if (kdCoeff < 0.0) {
        kdCoeff = 0.0;
    }
    vec3 dColor = lColor*kdCoeff*uKd;
    */


    // Specular color
    // Find a vector from the uEye to tpos.  Then take its 
    // dot product with the vector to the light reflected 
    // about the normal, raised to a power 
    vec3 dh = normalize(uEye - tpos);
    vec3 h = -reflect(L, NT);
    float ksCoeff = dot(h, dh);
    if (ksCoeff < 0.0) {
        ksCoeff = 0.0;
    }
    ksCoeff = pow(ksCoeff, uShininess);
    vec3 sColor = lColor*ksCoeff*uKs;

    vec3 color = sColor + dColor;

    float fac = 1.0;
    // TODO: If you're doing quantization, fill in fac appropriately

    gl_FragColor = vec4(fac*color, 1.0);
}
