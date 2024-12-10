import { Bell, ChevronDown, MoreVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, Transition } from '@headlessui/react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../../types/profile';
import { useRef, useState, useEffect } from 'react';

interface NotificationsPanelProps {
  notifications: Notification[];
  isLoading: boolean;
  onNotificationClick: (notificationId: string) => void;
  onToggleRead: (e: React.MouseEvent, notificationId: string) => void;
  onDelete: (e: React.MouseEvent, notificationId: string) => void;
}

export function NotificationsPanel({
  notifications,
  isLoading,
  onNotificationClick,
  onToggleRead,
  onDelete
}: NotificationsPanelProps) {
  return (
    <Disclosure>
      {({ open }) => (
        <div className="mb-6">
          <DisclosureButton className={`w-full px-4 py-4 text-left flex justify-between items-center bg-white dark:bg-neutral-800 ${open ? 'rounded-t-lg' : 'rounded-lg'} shadow-sm`}>
            <div className="flex items-center gap-2">
              <Bell className={`w-5 h-5 ${notifications.filter(n => !n.read).length > 0 ? 'text-red-500' : 'text-neutral-500'}`} />
              <span className="text-lg font-medium">Notifications</span>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 text-neutral-500 transform transition-transform ${open ? 'rotate-180' : ''}`} />
          </DisclosureButton>
          <DisclosurePanel className="px-6 pb-6 bg-white dark:bg-neutral-800 rounded-b-lg shadow-sm">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-neutral-600">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="text-neutral-600">No notifications</div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                        index !== notifications.length - 1 ? 'border-b border-neutral-200 dark:border-neutral-700' : ''
                      } relative`}
                      onClick={() => onNotificationClick(notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className={`text-sm text-neutral-900 dark:text-neutral-100 ${!notification.read ? 'font-semibold' : ''} pr-8`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Menu as="div" className="relative">
                          {({ open }) => {
                            const buttonRef = useRef<HTMLButtonElement>(null);
                            const [showAbove, setShowAbove] = useState(false);

                            useEffect(() => {
                              if (open && buttonRef.current) {
                                const buttonRect = buttonRef.current.getBoundingClientRect();
                                const windowHeight = window.innerHeight;
                                const spaceBelow = windowHeight - buttonRect.bottom;
                                setShowAbove(spaceBelow < 200); // Menu height + buffer
                              }
                            }, [open]);

                            return (
                              <div>
                                <Menu.Button 
                                  ref={buttonRef}
                                  className="p-3 -m-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="w-5 h-5 text-neutral-400" />
                                </Menu.Button>
                                <Transition
                                  show={open}
                                  enter="transition ease-out duration-100"
                                  enterFrom="transform opacity-0 scale-95"
                                  enterTo="transform opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="transform opacity-100 scale-100"
                                  leaveTo="transform opacity-0 scale-95"
                                >
                                  <Menu.Items 
                                    className={`absolute ${showAbove ? 'bottom-full mb-1' : 'top-full mt-1'} right-0 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[100]`}
                                  >
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          className={`${
                                            active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                          } group flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleRead(e, notification.id);
                                          }}
                                        >
                                          {notification.read ? (
                                            <>
                                              <EyeOff className="w-4 h-4 mr-3 text-neutral-400" />
                                              Mark as Unread
                                            </>
                                          ) : (
                                            <>
                                              <Eye className="w-4 h-4 mr-3 text-neutral-400" />
                                              Mark as Read
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          className={`${
                                            active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                          } group flex items-center w-full px-4 py-2 text-sm text-red-600`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(e, notification.id);
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4 mr-3" />
                                          Delete
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </Menu.Items>
                                </Transition>
                              </div>
                            );
                          }}
                        </Menu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DisclosurePanel>
        </div>
      )}
    </Disclosure>
  );
}
