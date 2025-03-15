'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

/**
 * 用户信息同步组件
 * 在用户登录后自动同步用户信息到数据库
 */
export function UserSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [synced, setSynced] = useState(false);
  const [syncAttempts, setSyncAttempts] = useState(0);
  const maxSyncAttempts = 3;

  useEffect(() => {
    // 如果用户已登录且尚未同步且尝试次数未超过最大值
    if (
      isLoaded &&
      isSignedIn &&
      user &&
      !synced &&
      syncAttempts < maxSyncAttempts
    ) {
      const syncUser = async () => {
        try {
          console.log('正在同步用户信息...', user);

          // 使用正确的API路径，包含basePath
          const response = await fetch('/styleai/api/users/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          // 增加尝试次数
          setSyncAttempts((prev) => prev + 1);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`同步失败: ${response.status}`, errorText);

            // 如果已经尝试了最大次数，则创建一个临时ID
            if (syncAttempts >= maxSyncAttempts - 1) {
              console.log('同步尝试次数已达最大值，创建临时ID');
              const tempId = `temp-${Date.now()}`;
              localStorage.setItem('dbUserId', tempId);
              console.log(`已创建临时ID: ${tempId}`);
              setSynced(true);
            }

            return;
          }

          const result = await response.json();
          console.log('用户信息同步成功:', result);

          // 标记为已同步
          setSynced(true);

          // 将用户ID存储在localStorage中，以便后续使用
          if (result.userId) {
            localStorage.setItem('dbUserId', result.userId);
          } else {
            // 如果没有返回userId，创建一个临时ID
            const tempId = `temp-${Date.now()}`;
            localStorage.setItem('dbUserId', tempId);
            console.log(`未返回userId，已创建临时ID: ${tempId}`);
          }
        } catch (error) {
          console.error('同步用户信息失败:', error);

          // 如果同步失败，但已经尝试了最大次数，则创建一个临时ID
          if (syncAttempts >= maxSyncAttempts - 1) {
            console.log('同步尝试次数已达最大值，创建临时ID');
            const tempId = `temp-${Date.now()}`;
            localStorage.setItem('dbUserId', tempId);
            console.log(`已创建临时ID: ${tempId}`);
            setSynced(true);
          }
        }
      };

      syncUser();
    }
  }, [isLoaded, isSignedIn, user, synced, syncAttempts]);

  // 这是一个无UI组件，不渲染任何内容
  return null;
}
