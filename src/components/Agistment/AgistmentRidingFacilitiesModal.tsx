import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Agistment } from '../../types/agistment';
import { Tab } from '@headlessui/react';
import { classNames } from '../../utils/classNames';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { ArenaDiagram } from './ArenaDiagram';
import { RoundYardDiagram } from './RoundYardDiagram';
import NumberStepper from '../shared/NumberStepper';

interface Props {
  agistmentId: string;
  ridingFacilities: Agistment['ridingFacilities'];
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedAgistment: Partial<Agistment>) => void;
}

interface ArenaForm {
  length: number;
  width: number;
  comments: string;
  features: string[];
}

interface RoundYardForm {
  diameter: number;
  comments: string;
}

export const AgistmentRidingFacilitiesModal = ({
  ridingFacilities,
  isOpen,
  onClose,
  onUpdate
}: Props) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [editForm, setEditForm] = useState({
    arenas: ridingFacilities.arenas?.map(arena => ({
      length: arena.length || 0,
      width: arena.width || 0,
      comments: arena.comments || '',
      features: arena.features || []
    })) || [],
    roundYards: ridingFacilities.roundYards?.map(yard => ({
      diameter: yard.diameter || 0,
      comments: yard.comments || ''
    })) || []
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditForm({
        arenas: ridingFacilities.arenas?.map(arena => ({
          length: arena.length || 0,
          width: arena.width || 0,
          comments: arena.comments || '',
          features: arena.features || []
        })) || [],
        roundYards: ridingFacilities.roundYards?.map(yard => ({
          diameter: yard.diameter || 0,
          comments: yard.comments || ''
        })) || []
      });
      setIsDirty(false);
      setSelectedTab(0);
    }
  }, [isOpen, ridingFacilities]);

  const handleUpdateFacilities = async () => {
    if (!isDirty) return;
    setIsUpdating(true);
    
    try {
      if (onUpdate) {
        await onUpdate({
          ridingFacilities: {
            arenas: editForm.arenas,
            roundYards: editForm.roundYards
          }
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to update riding facilities:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddArena = () => {
    setEditForm(prev => ({
      ...prev,
      arenas: [...prev.arenas, { length: 0, width: 0, comments: '', features: [] }]
    }));
    setIsDirty(true);
  };

  const handleAddRoundYard = () => {
    setEditForm(prev => ({
      ...prev,
      roundYards: [...prev.roundYards, { diameter: 0, comments: '' }]
    }));
    setIsDirty(true);
  };

  const handleRemoveArena = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      arenas: prev.arenas.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const handleRemoveRoundYard = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      roundYards: prev.roundYards.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const handleUpdateArena = (index: number, field: keyof ArenaForm, value: any) => {
    setEditForm(prev => ({
      ...prev,
      arenas: prev.arenas.map((arena, i) => 
        i === index ? { ...arena, [field]: value } : arena
      )
    }));
    setIsDirty(true);
  };

  const handleUpdateRoundYard = (index: number, field: keyof RoundYardForm, value: any) => {
    setEditForm(prev => ({
      ...prev,
      roundYards: prev.roundYards.map((yard, i) => 
        i === index ? { ...yard, [field]: value } : yard
      )
    }));
    setIsDirty(true);
  };

  const handleAddFeature = (arenaIndex: number, feature: string) => {
    if (!feature.trim()) return;
    
    setEditForm(prev => {
      const newArenas = [...prev.arenas];
      newArenas[arenaIndex] = {
        ...newArenas[arenaIndex],
        features: [...newArenas[arenaIndex].features, feature.trim()]
      };
      return { ...prev, arenas: newArenas };
    });
    setIsDirty(true);
  };

  const handleRemoveFeature = (arenaIndex: number, featureIndex: number) => {
    setEditForm(prev => {
      const newArenas = [...prev.arenas];
      newArenas[arenaIndex] = {
        ...newArenas[arenaIndex],
        features: newArenas[arenaIndex].features.filter((_, index) => index !== featureIndex)
      };
      return { ...prev, arenas: newArenas };
    });
    setIsDirty(true);
  };

  const tabs = ['Arenas', 'Round Yards'];

  return (
    <Modal
      title="Edit Riding Facilities"
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      contentHash={JSON.stringify(editForm)}
      onDirtyChange={setIsDirty}
      isUpdating={isUpdating}
      footerContent={({ isUpdating }) => (
        <div className="flex w-full gap-2">
          <button
            onClick={onClose}
            className="w-1/3 px-4 py-2.5 text-sm font-medium rounded-md text-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateFacilities}
            disabled={!isDirty || isUpdating}
            className={`w-2/3 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
              !isDirty || isUpdating
                ? 'text-neutral-500 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700 opacity-50 cursor-not-allowed'
                : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600'
            }`}
          >
            {isUpdating ? (
              <>
                <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      )}
    >
      <div className="h-[800px] overflow-y-auto">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <div className="sticky top-0 z-20 bg-white py-2">
            <Tab.List className="flex space-x-1 rounded-xl bg-neutral-100 p-1">
              {tabs.map((tab) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white/60 ring-offset-2 ring-offset-neutral-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white shadow text-neutral-900'
                        : 'text-neutral-700 hover:bg-white/[0.12] hover:text-neutral-900'
                    )
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>
          </div>
          <div className="px-2">
            <Tab.Panels>
              <Tab.Panel>
                <div className="space-y-4">
                  <div className="space-y-4">
                    {editForm.arenas.map((arena, index) => (
                      <div key={index} className="p-4 border border-neutral-200 rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-medium">Arena {index + 1}</h3>
                          <button
                            onClick={() => handleRemoveArena(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <div className="flex flex-col sm:flex-row justify-center gap-8">
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-1 text-center">
                                Length (m)
                              </label>
                              <NumberStepper
                                value={arena.length}
                                onChange={(value) => handleUpdateArena(index, 'length', value)}
                                min={0}
                                max={999}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-1 text-center">
                                Width (m)
                              </label>
                              <NumberStepper
                                value={arena.width}
                                onChange={(value) => handleUpdateArena(index, 'width', value)}
                                min={0}
                                max={999}
                              />
                            </div>
                          </div>
                          <div className="flex justify-center items-center h-[200px] pl-8 pr-8">
                            <ArenaDiagram length={arena.length} width={arena.width} />
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Comments
                              </label>
                              <input
                                type="text"
                                className="form-input w-full"
                                value={arena.comments}
                                onChange={(e) => handleUpdateArena(index, 'comments', e.target.value)}
                                placeholder="Add any additional information..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Features
                              </label>
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    className="form-input flex-1"
                                    placeholder="Add a feature (e.g., Lighting, Sprinklers)"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddFeature(index, e.currentTarget.value);
                                        e.currentTarget.value = '';
                                      }
                                    }}
                                  />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {arena.features.map((feature, featureIndex) => (
                                    <div
                                      key={featureIndex}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-md"
                                    >
                                      <span className="text-sm">{feature}</span>
                                      <button
                                        onClick={() => handleRemoveFeature(index, featureIndex)}
                                        className="text-neutral-500 hover:text-red-600"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleAddArena}
                    className="w-full flex items-center justify-center px-4 py-3 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Arena
                  </button>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="space-y-4">
                  <div className="space-y-4">
                    {editForm.roundYards.map((yard, index) => (
                      <div key={index} className="p-4 border border-neutral-200 rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-medium">Round Yard {index + 1}</h3>
                          <button
                            onClick={() => handleRemoveRoundYard(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex justify-center items-center h-[200px]">
                            <RoundYardDiagram diameter={yard.diameter} />
                          </div>
                          <div>
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Diameter (m)
                              </label>
                              <NumberStepper
                                value={yard.diameter}
                                onChange={(value) => handleUpdateRoundYard(index, 'diameter', value)}
                                min={0}
                                max={999}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Comments
                              </label>
                              <input
                                type="text"
                                className="form-input w-full"
                                value={yard.comments}
                                onChange={(e) => handleUpdateRoundYard(index, 'comments', e.target.value)}
                                placeholder="Add any additional information..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleAddRoundYard}
                    className="w-full flex items-center justify-center px-4 py-3 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Round Yard
                  </button>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </div>
        </Tab.Group>
      </div>
    </Modal>
  );
};
