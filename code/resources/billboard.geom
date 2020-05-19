#version 330 core
layout 
    (points)
    in;
layout
    (triangle_strip,
    max_vertices = 4)
    out;

in VS_OUT
{
    vec2 texCoords;
}
gs_in[];

out vec4		frag_Normal;
out vec4		frag_Pos;
out vec2		frag_UVs;

void main() {    
    frag_Pos = gl_in[0].gl_Position;
    gl_Position = gl_in[0].gl_Position + vec4(-0.2, -0.2, 0.0, 0.0);    // 1:bottom-left
    EmitVertex();   
    gl_Position = gl_in[0].gl_Position + vec4( 0.2, -0.2, 0.0, 0.0);    // 2:bottom-right
    EmitVertex();
    gl_Position = gl_in[0].gl_Position + vec4(-0.2,  0.2, 0.0, 0.0);    // 3:top-left
    EmitVertex();
    gl_Position = gl_in[0].gl_Position + vec4( 0.2,  0.2, 0.0, 0.0);    // 4:top-right
    EmitVertex();
    EndPrimitive();
}  