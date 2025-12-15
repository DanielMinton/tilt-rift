'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector2, Vector3, Raycaster, Plane } from 'three';
import { useGameStore } from '@/game/store/useGameStore';
import { Vector3Data } from '@/game/types';

interface VectorField {
  start: Vector3Data;
  end: Vector3Data;
  direction: Vector3Data;
  strength: number;
  createdAt: number;
  duration: number;
}

const FIELD_DURATION = 2000; // 2 seconds
const FIELD_COOLDOWN = 8000; // 8 seconds
const FIELD_STRENGTH = 3;
const MAX_PAINT_LENGTH = 10;

export function useMouseFields() {
  const { camera, gl, scene } = useThree();

  const [isDrawing, setIsDrawing] = useState(false);
  const [activeFields, setActiveFields] = useState<VectorField[]>([]);

  const mouseStartRef = useRef<Vector2 | null>(null);
  const paintPointsRef = useRef<Vector3[]>([]);
  const raycaster = useRef(new Raycaster());
  const groundPlane = useRef(new Plane(new Vector3(0, 1, 0), 0));

  const setMousePosition = useGameStore((state) => state.setMousePosition);
  const setMouseDown = useGameStore((state) => state.setMouseDown);
  const startCooldown = useGameStore((state) => state.startCooldown);
  const isCooldownReady = useGameStore((state) => state.isCooldownReady);
  const gameState = useGameStore((state) => state.gameState);

  const getWorldPosition = useCallback((screenX: number, screenY: number): Vector3 | null => {
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new Vector2(
      ((screenX - rect.left) / rect.width) * 2 - 1,
      -((screenY - rect.top) / rect.height) * 2 + 1
    );

    raycaster.current.setFromCamera(mouse, camera);

    const intersection = new Vector3();
    const hit = raycaster.current.ray.intersectPlane(groundPlane.current, intersection);

    return hit ? intersection : null;
  }, [camera, gl]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (gameState !== 'PLAYING') return;
    if (e.button !== 0) return; // Only left click

    mouseStartRef.current = new Vector2(e.clientX, e.clientY);
    setMouseDown(true);

    // Check if we can draw a vector field
    if (isCooldownReady('vectorField')) {
      setIsDrawing(true);
      paintPointsRef.current = [];

      const worldPos = getWorldPosition(e.clientX, e.clientY);
      if (worldPos) {
        paintPointsRef.current.push(worldPos);
      }
    }
  }, [gameState, setMouseDown, isCooldownReady, getWorldPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });

    if (!isDrawing || gameState !== 'PLAYING') return;

    const worldPos = getWorldPosition(e.clientX, e.clientY);
    if (worldPos && paintPointsRef.current.length > 0) {
      const lastPoint = paintPointsRef.current[paintPointsRef.current.length - 1];
      const distance = worldPos.distanceTo(lastPoint);

      // Only add point if moved enough
      if (distance > 0.5) {
        paintPointsRef.current.push(worldPos);

        // Limit paint length
        const totalLength = paintPointsRef.current.reduce((acc, point, i) => {
          if (i === 0) return 0;
          return acc + point.distanceTo(paintPointsRef.current[i - 1]);
        }, 0);

        if (totalLength > MAX_PAINT_LENGTH) {
          // Stop drawing
          finishDrawing();
        }
      }
    }
  }, [isDrawing, gameState, setMousePosition, getWorldPosition]);

  const finishDrawing = useCallback(() => {
    if (!isDrawing || paintPointsRef.current.length < 2) {
      setIsDrawing(false);
      paintPointsRef.current = [];
      return;
    }

    const points = paintPointsRef.current;
    const start = points[0];
    const end = points[points.length - 1];

    const direction = new Vector3()
      .subVectors(end, start)
      .normalize();

    const field: VectorField = {
      start: { x: start.x, y: start.y, z: start.z },
      end: { x: end.x, y: end.y, z: end.z },
      direction: { x: direction.x, y: direction.y, z: direction.z },
      strength: FIELD_STRENGTH,
      createdAt: Date.now(),
      duration: FIELD_DURATION,
    };

    setActiveFields((prev) => [...prev, field]);
    startCooldown('vectorField', FIELD_COOLDOWN / 1000);

    setIsDrawing(false);
    paintPointsRef.current = [];
  }, [isDrawing, startCooldown]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;

    setMouseDown(false);
    mouseStartRef.current = null;

    if (isDrawing) {
      finishDrawing();
    }
  }, [setMouseDown, isDrawing, finishDrawing]);

  // Clean up expired fields
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveFields((prev) =>
        prev.filter((field) => now - field.createdAt < field.duration)
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canvas = gl.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gl.domElement, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Get force at a position from all active fields
  const getFieldForceAtPosition = useCallback((position: Vector3Data): Vector3Data => {
    let totalForce = { x: 0, y: 0, z: 0 };
    const pos = new Vector3(position.x, position.y, position.z);

    activeFields.forEach((field) => {
      const fieldStart = new Vector3(field.start.x, field.start.y, field.start.z);
      const fieldEnd = new Vector3(field.end.x, field.end.y, field.end.z);
      const fieldLine = new Vector3().subVectors(fieldEnd, fieldStart);
      const fieldLength = fieldLine.length();

      // Project position onto field line
      const t = Math.max(0, Math.min(1,
        new Vector3().subVectors(pos, fieldStart).dot(fieldLine) / (fieldLength * fieldLength)
      ));

      const closestPoint = new Vector3().addVectors(
        fieldStart,
        fieldLine.clone().multiplyScalar(t)
      );

      const distance = pos.distanceTo(closestPoint);
      const falloff = Math.max(0, 1 - distance / 3); // 3 unit falloff radius

      if (falloff > 0) {
        totalForce.x += field.direction.x * field.strength * falloff;
        totalForce.y += field.direction.y * field.strength * falloff;
        totalForce.z += field.direction.z * field.strength * falloff;
      }
    });

    return totalForce;
  }, [activeFields]);

  return {
    isDrawing,
    activeFields,
    paintPoints: paintPointsRef.current,
    getFieldForceAtPosition,
    cooldownReady: isCooldownReady('vectorField'),
  };
}

export default useMouseFields;
