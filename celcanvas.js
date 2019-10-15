/**
    A class to teach students about cel shading

    Assumes that
    ggslac/viewers/scenecanvas.js
    ggslac/viewers/basecanvas.js
    have been included already
 */


/**
 * 
 * @param {DOM Element} glcanvas Handle to HTML where the glcanvas resides
 */
function CelCanvas(glcanvas, shadersrelpath, meshesrelpath) {
    SceneCanvas(glcanvas, shadersrelpath, meshesrelpath);

    /** Initialize cel shaders */
    let gl = glcanvas.gl;
    let celShader = getShaderProgram(gl, "cel");
    celShader.vPosAttrib = gl.getAttribLocation(celShader, "vPos");
    gl.enableVertexAttribArray(celShader.vPosAttrib);
    celShader.vNormalAttrib = gl.getAttribLocation(celShader, "vNormal");
    gl.enableVertexAttribArray(celShader.normalAttrib);
    celShader.pMatrixUniform = gl.getUniformLocation(celShader, "uPMatrix");
    celShader.mvMatrixUniform = gl.getUniformLocation(celShader, "uMVMatrix");
    celShader.tMatrixUniform = gl.getUniformLocation(celShader, "tMatrix");
    celShader.nMatrixUniform = gl.getUniformLocation(celShader, "uNMatrix");
    celShader.ambientColorUniform = gl.getUniformLocation(celShader, "uAmbientColor");
    celShader.light1PosUniform = gl.getUniformLocation(celShader, "uLight1Pos");
    celShader.light1ColorUniform = gl.getUniformLocation(celShader, "uLight1Color");
    celShader.light1AttenUniform = gl.getUniformLocation(celShader, "uLight1Atten");
    celShader.uKaUniform = gl.getUniformLocation(celShader, "uKa");
    celShader.uKdUniform = gl.getUniformLocation(celShader, "uKd");
    celShader.uKsUniform = gl.getUniformLocation(celShader, "uKs");
    celShader.uShininessUniform = gl.getUniformLocation(celShader, "uShininess");
    celShader.uEyeUniform = gl.getUniformLocation(celShader, "uEye");
    celShader.uNumLevelsUniform = gl.getUniformLocation(celShader, "uNumLevels");
    glcanvas.celShader = celShader;


    /** Initialize updated repaint functions */
    glcanvas.repaintRecurse = function(node, transform) {
        let nextTransform = glMatrix.mat4.create();
        glMatrix.mat4.mul(nextTransform, transform, node.transform);
        node.shapes.forEach(function(shape) {
            if ('mesh' in shape) {
                if (!(shape.mesh === null)) {
                    if ('material' in shape) {
                        glcanvas.material = shape.material;
                    }
                    else if ('material' in glcanvas) {
                        delete glcanvas.material;
                    }
                    // There may be an additional transform to apply based
                    // on shape properties of special shapes (e.g. box width)
                    let tMatrix = glMatrix.mat4.create();
                    glMatrix.mat4.mul(tMatrix, nextTransform, shape.ms);
                    shape.mesh.render(glcanvas, tMatrix);
                }
            }
        });
        if ('children' in node) {
            for (let i = 0; i < node.children.length; i++) {
                glcanvas.repaintRecurse(node.children[i], nextTransform);
            }
        }
    }

    glcanvas.oldRepaint = glcanvas.repaint;
    glcanvas.repaint = function() {
        let gl = glcanvas.gl;
        if (glcanvas.useCelShading) {
            gl.useProgram(glcanvas.celShader);
            gl.uniform1f(glcanvas.celShader.uNumLevelsUniform, glcanvas.NumLevels);
        }
        glcanvas.oldRepaint();
    }


    let menu = glcanvas.gui.addFolder('Cel Shading');
    glcanvas.useCelShading = false;
    menu.add(glcanvas, 'useCelShading').onChange(
        function(v) {
            if (v) {
                glcanvas.lastShader = glcanvas.shaderToUse;
                glcanvas.shaderToUse = glcanvas.celShader;
            }
            else {
                glcanvas.shaderToUse = glcanvas.lastShader;
            }
            requestAnimFrame(glcanvas.repaint);
        }
    );
    glcanvas.NumLevels = 8;
    menu.add(glcanvas, 'NumLevels', 1, 40).step(1).onChange(
        function() {
            requestAnimFrame(glcanvas.repaint);
        }
    );
    glcanvas.celMenu = menu;
}
