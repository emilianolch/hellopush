Rails.application.routes.draw do
  root 'notifications#index'
  post 'notifications/save_subscription', to: 'notifications#save_subscription'
  post 'notifications/send', to: 'notifications#send_message'
end
