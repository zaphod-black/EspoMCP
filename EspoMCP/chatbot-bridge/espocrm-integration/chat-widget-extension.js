/**
 * EspoCRM Chat Widget Extension
 * 
 * This file should be added to your EspoCRM custom JavaScript files
 * to integrate the AI chat assistant directly into the EspoCRM interface.
 * 
 * Installation:
 * 1. Copy this file to: custom/Espo/Custom/Resources/metadata/app/client.json
 * 2. Add the script reference to load this module
 * 3. Or include directly in your custom layout template
 */

// Define the EspoCRM Chat Widget Module
Espo.define('custom:chat-widget', [], function () {

    return Espo.View.extend({

        template: 'custom:chat-widget',

        events: {
            'click [data-action="toggleChat"]': function () {
                this.toggleChatWidget();
            }
        },

        data: function () {
            return {
                chatServerUrl: this.getChatServerUrl()
            };
        },

        setup: function () {
            this.chatServerUrl = this.getChatServerUrl();
            this.chatWidget = null;
            this.isLoaded = false;

            // Load the chat widget after view is rendered
            this.once('after:render', () => {
                this.loadChatWidget();
            });
        },

        getChatServerUrl: function () {
            // Configure your chatbot server URL here
            // This should point to your chatbot bridge server
            return this.getConfig().get('chatServerUrl') || 'http://localhost:3001';
        },

        loadChatWidget: function () {
            if (this.isLoaded) return;

            // Set global configuration for the chat widget
            window.ESPOCRM_CHAT_SERVER = this.chatServerUrl;
            
            // Pass EspoCRM user context to the chat widget
            window.ESPOCRM_USER_CONTEXT = {
                userId: this.getUser().id,
                userName: this.getUser().get('userName'),
                userEmail: this.getUser().get('emailAddress'),
                userRole: this.getUser().get('type'),
                userTeams: this.getUser().get('teamsNames') || {}
            };

            // Load Socket.IO first
            this.loadScript(this.chatServerUrl + '/socket.io/socket.io.js')
                .then(() => {
                    // Then load the chat widget
                    return this.loadScript(this.chatServerUrl + '/api/widget.js');
                })
                .then(() => {
                    this.isLoaded = true;
                    console.log('EspoCRM Chat Widget loaded successfully');
                })
                .catch((error) => {
                    console.error('Failed to load chat widget:', error);
                    this.showChatLoadError();
                });
        },

        loadScript: function (src) {
            return new Promise((resolve, reject) => {
                // Check if script is already loaded
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                document.head.appendChild(script);
            });
        },

        showChatLoadError: function () {
            Espo.Ui.warning(
                'Chat widget could not be loaded. Please check if the chat server is running.',
                'Chat Widget Error'
            );
        },

        toggleChatWidget: function () {
            // This will be handled by the loaded chat widget
            // The widget itself manages the open/close state
            if (window.EspoCRMChatWidget) {
                window.EspoCRMChatWidget.toggle();
            }
        },

        // Enhanced context passing to chat widget
        getCRMContext: function () {
            const context = {
                currentView: this.getRouter().getLast().controller,
                currentModel: null,
                currentRecord: null
            };

            // Try to get current record context if available
            const currentView = this.getParentView();
            if (currentView && currentView.model) {
                context.currentModel = currentView.model.entityType;
                context.currentRecord = {
                    id: currentView.model.id,
                    name: currentView.model.get('name') || currentView.model.id,
                    entityType: currentView.model.entityType
                };
            }

            return context;
        }
    });
});

// Auto-initialize the chat widget in the main application
Espo.define('custom:application-enhanced', 'application', function (Dep) {
    
    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);
            
            // Initialize chat widget after application is ready
            this.on('ready', () => {
                this.initializeChatWidget();
            });
        },

        initializeChatWidget: function () {
            // Only load chat widget if user has appropriate permissions
            if (this.getUser().isAdmin() || this.getAcl().check('User', 'read')) {
                this.createView('chatWidget', 'custom:chat-widget', {
                    el: 'body' // Append to body so it's always available
                });
            }
        }
    });
});

// CSS Styles for EspoCRM Integration
const espoCrmChatStyles = `
    /* Override default chat widget styles for EspoCRM integration */
    .espocrm-chat-widget {
        z-index: 9999 !important; /* Ensure it's above EspoCRM modals */
    }
    
    /* EspoCRM-specific responsive adjustments */
    @media (max-width: 768px) {
        .espocrm-chat-widget .espocrm-chat-window {
            width: calc(100vw - 20px) !important;
            height: calc(100vh - 100px) !important;
            bottom: 70px !important;
            right: 10px !important;
        }
    }
    
    /* Integration with EspoCRM theme colors */
    .espocrm-chat-widget .espocrm-chat-bubble {
        background: linear-gradient(135deg, #337ab7, #2e6da4) !important;
    }
    
    .espocrm-chat-widget .espocrm-chat-header {
        background: #337ab7 !important;
    }
    
    .espocrm-chat-widget .espocrm-chat-message.user .espocrm-chat-message-bubble {
        background: #337ab7 !important;
    }
    
    .espocrm-chat-widget .espocrm-chat-send {
        background: #337ab7 !important;
    }
    
    .espocrm-chat-widget .espocrm-chat-send:hover {
        background: #2e6da4 !important;
    }
`;

// Inject EspoCRM-specific styles
if (!document.getElementById('espocrm-chat-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'espocrm-chat-styles';
    styleSheet.textContent = espoCrmChatStyles;
    document.head.appendChild(styleSheet);
}

// Template for the chat widget trigger (if you want a manual trigger button)
/*
Template file: custom/Espo/Custom/Resources/templates/custom/chat-widget.tpl

<div class="chat-widget-container">
    {{#if isEnabled}}
        <button type="button" class="btn btn-primary chat-trigger-btn" data-action="toggleChat">
            <i class="fas fa-comments"></i> AI Assistant
        </button>
    {{/if}}
</div>
*/