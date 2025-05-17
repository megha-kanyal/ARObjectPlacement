import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useARStore } from "@/lib/stores/useARStore";

// Create a wood texture directly in memory
const createWoodTexture = () => {
  // Create a canvas for the texture
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Fill with a wood-like color
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, 128, 128);
    
    // Add some grain
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const size = Math.random() * 3;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
      ctx.fillRect(x, y, size, size);
    }
    
    // Add some wood grain lines
    for (let i = 0; i < 10; i++) {
      const y = i * 12 + Math.random() * 5;
      ctx.strokeStyle = `rgba(60, 30, 0, ${Math.random() * 0.2 + 0.1})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      
      // Create a wavy line
      for (let x = 0; x < 128; x += 10) {
        const yOffset = y + Math.sin(x * 0.05) * 5;
        ctx.lineTo(x, yOffset);
      }
      
      ctx.stroke();
    }
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  
  return texture;
};

interface ARObjectProps {
  object: {
    id: string;
    type: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
  woodTexture: THREE.Texture | null;
  isSelected: boolean;
}

const ARObject = ({ object, woodTexture, isSelected }: ARObjectProps) => {
  const { setSelectedObjectId, editMode, updateObjectTransform } = useARStore();
  const meshRef = useRef<THREE.Mesh>(null);
  const [localTexture, setLocalTexture] = useState<THREE.Texture | null>(null);
  
  // Create our own texture on component mount
  useEffect(() => {
    // Create a texture directly in memory
    const texture = createWoodTexture();
    setLocalTexture(texture);
    
    return () => {
      // Clean up texture when component unmounts
      if (texture) {
        texture.dispose();
      }
    };
  }, []);
  
  // Apply the texture properly or create a fallback material
  const textureMaterial = React.useMemo(() => {
    // Use our local texture first, fall back to passed texture, or create a fallback material
    const textureToUse = localTexture || woodTexture;
    
    if (!textureToUse) {
      return new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Brown color
        roughness: 0.7,
        metalness: 0.1
      });
    }
    
    // Apply the texture
    textureToUse.wrapS = textureToUse.wrapT = THREE.RepeatWrapping;
    textureToUse.repeat.set(1, 1);
    
    return new THREE.MeshStandardMaterial({
      map: textureToUse,
      roughness: 0.7,
      metalness: 0.1
    });
  }, [localTexture, woodTexture]);
  
  // Material for the selection outline
  const outlineMaterial = React.useMemo(() => 
    new THREE.MeshBasicMaterial({
      color: 0x4285F4,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    })
  , []);
  
  // Handle selection
  const handleClick = (e: any) => {
    e.stopPropagation();
    if (editMode) {
      setSelectedObjectId(object.id);
    }
  };
  
  // Update the mesh with latest transform values
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...object.position);
      meshRef.current.rotation.set(...object.rotation);
      meshRef.current.scale.set(...object.scale);
    }
  }, [object]);
  
  // Highlight effect for selected objects
  useFrame((state, delta) => {
    if (isSelected && meshRef.current) {
      // Make selected object subtly pulse
      const t = state.clock.getElapsedTime();
      const pulse = 1 + Math.sin(t * 3) * 0.05;
      meshRef.current.scale.set(
        object.scale[0] * pulse,
        object.scale[1] * pulse,
        object.scale[2] * pulse
      );
    }
  });
  
  // Render the appropriate geometry based on type
  const renderGeometry = () => {
    switch (object.type) {
      case "cube":
        return <boxGeometry args={[1, 1, 1]} />;
      case "sphere":
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case "cylinder":
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case "cone":
        return <coneGeometry args={[0.5, 1, 32]} />;
      case "chair":
        // A simple chair made of cubes
        return (
          <group>
            {/* Seat */}
            <mesh position={[0, 0.4, 0]} scale={[1, 0.1, 1]}>
              <boxGeometry />
              {textureMaterial}
            </mesh>
            
            {/* Backrest */}
            <mesh position={[0, 0.9, -0.45]} scale={[1, 1, 0.1]}>
              <boxGeometry />
              {textureMaterial}
            </mesh>
            
            {/* Legs */}
            <mesh position={[0.4, 0, 0.4]} scale={[0.1, 0.8, 0.1]}>
              <boxGeometry />
              {textureMaterial}
            </mesh>
            <mesh position={[-0.4, 0, 0.4]} scale={[0.1, 0.8, 0.1]}>
              <boxGeometry />
              {textureMaterial}
            </mesh>
            <mesh position={[0.4, 0, -0.4]} scale={[0.1, 0.8, 0.1]}>
              <boxGeometry />
              {textureMaterial}
            </mesh>
            <mesh position={[-0.4, 0, -0.4]} scale={[0.1, 0.8, 0.1]}>
              <boxGeometry />
              {textureMaterial}
            </mesh>
          </group>
        );
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };
  
  // For simple objects, render a basic mesh
  if (object.type !== "chair") {
    return (
      <group>
        {/* Main object */}
        <mesh
          ref={meshRef}
          position={object.position}
          rotation={object.rotation}
          scale={object.scale}
          onClick={handleClick}
          castShadow
          receiveShadow
        >
          {renderGeometry()}
          {textureMaterial}
        </mesh>
        
        {/* Selection outline - only shown when selected */}
        {isSelected && (
          <mesh
            position={object.position}
            rotation={object.rotation}
            scale={[
              object.scale[0] * 1.05,
              object.scale[1] * 1.05,
              object.scale[2] * 1.05
            ]}
          >
            {renderGeometry()}
            {outlineMaterial}
          </mesh>
        )}
      </group>
    );
  }
  
  // For the chair, return the group directly
  return (
    <group
      ref={meshRef}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={handleClick}
    >
      {renderGeometry()}
      
      {/* Selection outline for the chair */}
      {isSelected && (
        <mesh scale={[1.05, 1.05, 1.05]}>
          <boxGeometry />
          {outlineMaterial}
        </mesh>
      )}
    </group>
  );
};

export default ARObject;
