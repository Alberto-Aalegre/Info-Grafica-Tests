#version 330
		
in vec4			frag_Normal;
in vec4			frag_Pos;
in vec2			frag_UVs;
in mat3			frag_TBN;

out vec4		out_Color;

uniform mat4	mv_Mat; 


uniform vec4	_color_diffuse;
uniform vec4	_color_ambient;
uniform vec4	_color_specular;
uniform float	_specular_strength;
uniform float	_normal_strength;


uniform sampler2D _albedo;
uniform sampler2D _normal;
uniform sampler2D _specular;

uniform float diffuseStepWidth = 0.25;
uniform float diffuseStepCount = 15;
uniform float specularWidth = 0.25;

#define LIGHT_POINT_MAX 16

struct PointLight {
	bool enabled;
    vec4 position;
    vec4 color;
	float strength;
	vec4 getDiffuse(vec4 d_vertexNormal, vec4 d_vertexPosition, vec4 d_diffuseColor, vec4 d_diffuseStrength)
	{
		vec4 d_light_direction = normalize(position - d_vertexPosition);
		float d_light_distance = distance(position, d_vertexPosition);
		float d_light_towards = dot(d_vertexNormal, d_light_direction) / diffuseStepWidth;
		d_light_towards = d_light_towards * dot(d_diffuseStrength.rgb, vec3(0.299, 0.587, 0.114));
		float d_light_strength = ceil(d_light_towards);
		d_light_strength = d_light_strength / diffuseStepCount;
		return max(d_light_strength, 0)
			* d_diffuseColor * color * strength
//			/ (d_light_distance*d_light_distance)
			;
	}
	vec4 getSpecular(vec4 s_vertexNormal, vec4 s_vertexPosition, vec4 s_specularColor, mat4 s_modelView, float s_strength)
	{
		vec4 s_light_direction = normalize(position - s_vertexPosition);
		float s_light_distance = distance(position, s_vertexPosition);
		vec4 s_camera_position = inverse(s_modelView)[3];
		vec4 s_camera_direction = normalize(s_camera_position - s_vertexPosition);
		vec4 s_ref_direction = reflect(-s_light_direction, s_vertexNormal);
		float s_light_towards = dot(s_camera_direction, s_ref_direction);
		s_light_towards = max(s_light_towards * s_strength, 0.0);

		float s_change = fwidth(s_light_towards);
		float s_intensity = smoothstep(1 - specularWidth, 1 - specularWidth + s_change, s_light_towards);
//		if(s_specularColor.x < 0.1)s_specularColor.x = 0;
//		else s_specularColor.x = 1;
//		if(s_specularColor.y < 0.1)s_specularColor.y = 0;
//		else s_specularColor.y = 1;
//		if(s_specularColor.z < 0.1)s_specularColor.z = 0;
//		else s_specularColor.z = 1;
		return min(s_intensity, 1.0) * s_specularColor * color * strength
//			/ (s_light_distance*s_light_distance)
			;
	}
};

uniform PointLight lights[LIGHT_POINT_MAX];



void main(){

	vec4 diffuse;
	vec4 specular;
	vec3 fixed_normal_tex = (texture(_normal, frag_UVs ).rgb * 0.5 + 0.5);
	vec4 frag_Normal_n = vec4(normalize(frag_TBN * fixed_normal_tex), 0) * _normal_strength;
	vec4 specular_tex = texture(_specular, frag_UVs);
	vec4 specular_tex_color = specular_tex;
	specular_tex_color.w = 0;
	for	(int i = 0; i < LIGHT_POINT_MAX; i++){
		if(lights[i].enabled){
			diffuse += lights[i].getDiffuse(frag_Normal_n, frag_Pos, _color_diffuse, texture(_albedo, frag_UVs ));
			specular += lights[i].getSpecular(frag_Normal_n, frag_Pos, _color_specular, mv_Mat, specular_tex.w + _specular_strength);
		}
	}

//RESULT
	out_Color =
		+ _color_ambient
		+ diffuse
		+ specular;
}