Rails.application.routes.draw do
  root 'notifications#index'
  post 'notifications/save_subscription', to: 'notifications#save_subscription'
end
